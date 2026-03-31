package com.eramix.service;

import com.eramix.dto.globe.CountryStatsResponse;
import com.eramix.entity.University;
import com.eramix.repository.UniversityRepository;
import com.eramix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GlobeService {

    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;

    /**
     * Returns aggregated stats per country: how many EraMix students
     * are in each country (by destination_country), plus the universities
     * in that country and how many students each has.
     */
    public List<CountryStatsResponse> getCountryStats() {
        List<University> allUnis = universityRepository.findAll();

        // Group universities by country
        Map<String, List<University>> unisByCountry = allUnis.stream()
                .collect(Collectors.groupingBy(University::getCountry));

        List<CountryStatsResponse> result = new ArrayList<>();

        for (Map.Entry<String, List<University>> entry : unisByCountry.entrySet()) {
            String country = entry.getKey();
            List<University> unis = entry.getValue();

            // Count students with this destination country
            long countryStudentCount = userRepository
                    .findByDestinationCountryIgnoreCase(country).size();

            // Calculate country centroid from universities
            BigDecimal avgLat = unis.stream()
                    .filter(u -> u.getLatitude() != null)
                    .map(University::getLatitude)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal avgLon = unis.stream()
                    .filter(u -> u.getLongitude() != null)
                    .map(University::getLongitude)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long validCount = unis.stream()
                    .filter(u -> u.getLatitude() != null && u.getLongitude() != null)
                    .count();

            if (validCount > 0) {
                avgLat = avgLat.divide(BigDecimal.valueOf(validCount), 7, java.math.RoundingMode.HALF_UP);
                avgLon = avgLon.divide(BigDecimal.valueOf(validCount), 7, java.math.RoundingMode.HALF_UP);
            }

            // Build university info list with student counts
            List<CountryStatsResponse.UniversityInfo> uniInfos = unis.stream()
                    .map(u -> {
                        long hostCount = userRepository.findByHostUniversityId(u.getId()).size();
                        return CountryStatsResponse.UniversityInfo.builder()
                                .id(u.getId())
                                .name(u.getName())
                                .city(u.getCity())
                                .latitude(u.getLatitude())
                                .longitude(u.getLongitude())
                                .studentCount(hostCount)
                                .build();
                    })
                    .sorted(Comparator.comparingLong(
                            CountryStatsResponse.UniversityInfo::getStudentCount).reversed())
                    .collect(Collectors.toList());

            result.add(CountryStatsResponse.builder()
                    .country(country)
                    .studentCount(countryStudentCount)
                    .latitude(avgLat)
                    .longitude(avgLon)
                    .universities(uniInfos)
                    .build());
        }

        // Sort by student count descending
        result.sort(Comparator.comparingLong(CountryStatsResponse::getStudentCount).reversed());

        return result;
    }
}
