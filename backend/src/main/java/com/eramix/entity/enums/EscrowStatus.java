package com.eramix.entity.enums;

/**
 * Estados del escrow en el flujo de compraventa del marketplace.
 */
public enum EscrowStatus {
    RESERVED,
    ESCROWED,
    MEET_CONFIRMED_BUYER,
    MEET_CONFIRMED_SELLER,
    COMPLETED,
    DISPUTED,
    RESOLVED,
    CANCELLED
}
