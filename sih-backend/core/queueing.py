"""
Queueing-theory wait-time model for PS 26032 (Farmer Procurement System).

This is classical M/M/c queueing theory (the Erlang-C model), not a
statistical or machine-learned prediction: given a centre's number of
service counters (c), its measured average service time (which gives the
service rate mu = 1 / avg_service_minutes), and its arrival rate (lambda),
we model the centre as an M/M/c queue -- c parallel counters, Poisson
arrivals, exponential service times -- and derive wait-time estimates from
the exact equations of that model.

Two related quantities are implemented here:

* `erlang_c_mean_wait` is the textbook Erlang-C formula: the *average* wait
  in queue for a customer arriving at random to the system. It needs
  lambda, mu and c.

* `estimate_wait_minutes` is what the API actually uses. A checked-in
  farmer's exact position in the queue is known (unlike a "random arriving
  customer"), so instead of the population-average Erlang-C figure we use
  the exact position-conditional result for an M/M/c queue: while a queue
  exists, all c counters are continuously busy, and -- by the memoryless
  property of exponential service times -- service completions occur as a
  Poisson process of rate c*mu, regardless of how many people are waiting.
  A farmer at position n therefore waits for (n + 1) such completions:

      E[wait] = (n + 1) / (c * mu)

  This is not an alternative to Erlang-C, it's derived from the same M/M/c
  process: averaging this expression over the model's own steady-state
  queue-length distribution reproduces `erlang_c_mean_wait` exactly (see
  the docstring on that function). We use the position-conditional form
  because it is a strictly better estimate for one specific farmer than a
  system-wide average would be.

  Notably, lambda (the arrival rate) drops out of this formula. That is
  expected, not a bug: PS 26032's queue is first-come-first-served, so once
  a farmer's position is fixed, later arrivals join behind them and cannot
  change their wait. Lambda is still accepted as an optional parameter and
  used for one thing: detecting an overloaded centre (arrivals outpacing
  total service capacity), in which case a simple congestion penalty is
  applied since the backlog is actively growing rather than just draining.
"""

DEFAULT_AVG_SERVICE_MINUTES = 8
DEFAULT_NUM_COUNTERS = 2


def erlang_c_probability(servers, offered_load):
    """
    Erlang's C formula: the probability that an arriving customer to an
    M/M/c queue finds all `servers` counters busy and must wait.

    `offered_load` (a = lambda / mu) is in Erlangs. Computed via the
    standard Erlang-B recursion and the Erlang-B -> Erlang-C conversion,
    which is the numerically stable way to evaluate this (a direct
    factorial/power formula overflows for even moderate c):

        B(0, a) = 1
        B(n, a) = a * B(n-1, a) / (n + a * B(n-1, a))     for n = 1..c
        rho     = a / servers
        C(c, a) = B(c, a) / (1 - rho * (1 - B(c, a)))
    """
    if servers <= 0:
        raise ValueError('servers must be positive')
    if offered_load < 0:
        raise ValueError('offered_load cannot be negative')

    rho = offered_load / servers
    if rho >= 1:
        # Unstable system: arrivals outpace total service capacity, so the
        # queue grows without bound and Erlang-C's steady-state assumption
        # no longer holds. Every arrival effectively has to wait.
        return 1.0

    erlang_b = 1.0
    for n in range(1, servers + 1):
        erlang_b = (offered_load * erlang_b) / (n + offered_load * erlang_b)

    return erlang_b / (1 - rho * (1 - erlang_b))


def erlang_c_mean_wait(arrival_rate, service_rate, servers):
    """
    The standard M/M/c mean-wait-in-queue formula (Erlang-C):

        Wq = C(c, a) / (c*mu - lambda),      a = lambda / mu

    the average time a customer arriving at random spends waiting in queue
    before being served. `arrival_rate` (lambda) and `service_rate` (mu)
    must be in the same time unit (e.g. both per minute); the result is in
    that same unit.

    This is the theoretical *system-average* wait for a fresh arrival. A
    farmer who has already checked in has a known, exact queue position, so
    the API uses `estimate_wait_minutes` for that -- see the module
    docstring for how the two are related.
    """
    if service_rate <= 0 or servers <= 0:
        raise ValueError('service_rate and servers must be positive')
    if arrival_rate <= 0:
        return 0.0
    if arrival_rate >= servers * service_rate:
        # Overloaded: cap lambda just under capacity so the formula returns
        # a large-but-finite number instead of dividing by zero/negative.
        arrival_rate = 0.99 * servers * service_rate

    offered_load = arrival_rate / service_rate
    p_wait = erlang_c_probability(servers, offered_load)
    return p_wait / (servers * service_rate - arrival_rate)


def estimate_wait_minutes(position, avg_service_minutes, servers, arrivals_per_hour=0.0):
    """
    Expected wait, in minutes, for a farmer who has `position` other
    farmers ahead of them in the WAITING queue at a centre with `servers`
    service counters and a measured average service time of
    `avg_service_minutes` per farmer. See the module docstring for the
    derivation: E[wait] = (position + 1) / (servers * mu).

    `arrivals_per_hour` (lambda) is optional and only affects the result
    when the centre is currently overloaded (arrivals outpacing total
    service capacity: lambda >= servers * mu) -- in that regime the queue
    is actively growing, not just draining, so a simple congestion penalty
    scaled by how overloaded the centre is gets applied on top of the exact
    backlog-clearing time.
    """
    if avg_service_minutes <= 0 or servers <= 0:
        return 0.0

    mu_per_minute = 1 / avg_service_minutes
    wait_minutes = (position + 1) / (servers * mu_per_minute)

    if arrivals_per_hour > 0:
        lambda_per_minute = arrivals_per_hour / 60
        rho = lambda_per_minute / (servers * mu_per_minute)
        if rho >= 1:
            wait_minutes *= rho

    return wait_minutes
