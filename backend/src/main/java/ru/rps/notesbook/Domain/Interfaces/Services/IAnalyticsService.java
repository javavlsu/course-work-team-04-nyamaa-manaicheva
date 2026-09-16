package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.AnalyticsContracts;

import java.util.UUID;

public interface IAnalyticsService {

    AnalyticsContracts.AnalyticsResponse GetAnalytics(UUID userId);

}
