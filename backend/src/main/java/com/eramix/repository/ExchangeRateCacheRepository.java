package com.eramix.repository;

import com.eramix.entity.ExchangeRateCache;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExchangeRateCacheRepository extends JpaRepository<ExchangeRateCache, Long> {
    Optional<ExchangeRateCache> findByBaseCurrencyAndTargetCurrency(String base, String target);
}
