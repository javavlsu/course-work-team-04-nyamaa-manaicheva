package ru.rps.notesbook.Domain.Interfaces.Services;

import ru.rps.notesbook.API.Contracts.LogContracts;

public interface ILogService {

    LogContracts.LogsResponse GetLogs(Integer lines);

}
