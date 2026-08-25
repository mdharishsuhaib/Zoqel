package com.zoqel.transaction;

public enum FailureReason {
    BANK_TIMEOUT,
    NETWORK_ERROR,
    INSUFFICIENT_FUNDS,
    EXPIRED_CARD,
    DUPLICATE_ATTEMPT,
    REPEATED_FAILURE,
    UNKNOWN
}
