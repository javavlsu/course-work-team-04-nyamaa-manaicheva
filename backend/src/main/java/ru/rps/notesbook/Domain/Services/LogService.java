package ru.rps.notesbook.Domain.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ru.rps.notesbook.API.Contracts.LogContracts;
import ru.rps.notesbook.Domain.Interfaces.Services.ILogService;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

@Service
public class LogService implements ILogService {

    private static final Logger log = LoggerFactory.getLogger(LogService.class);

    private static final String LOG_FILE_NAME = "notesbook.log";
    private static final int DEFAULT_LOG_LINES = 500;
    private static final int MAX_LOG_LINES = 5000;
    private static final long MAX_TAIL_BYTES = 1024L * 1024;

    private final Path logFile;

    @Autowired
    public LogService(@Value("${logging.file.path:logs}") String logDirectory) {
        this.logFile = Paths.get(logDirectory).resolve(LOG_FILE_NAME);
    }

    @Override
    public LogContracts.LogsResponse GetLogs(Integer lines) {
        int limit = lines == null ? DEFAULT_LOG_LINES : Math.min(Math.max(lines, 1), MAX_LOG_LINES);

        if (!Files.isRegularFile(logFile)) {
            return new LogContracts.LogsResponse(false, "");
        }

        try (RandomAccessFile file = new RandomAccessFile(logFile.toFile(), "r")) {
            long length = file.length();
            long start = Math.max(0, length - MAX_TAIL_BYTES);
            byte[] buffer = new byte[(int) (length - start)];
            file.seek(start);
            file.readFully(buffer);

            String text = new String(buffer, StandardCharsets.UTF_8);
            String[] allLines = text.split("\\R", -1);

            int from = start > 0 ? 1 : 0;
            int to = allLines.length > 0 && allLines[allLines.length - 1].isEmpty()
                    ? allLines.length - 1
                    : allLines.length;

            if (from >= to) {
                return new LogContracts.LogsResponse(true, "");
            }

            int tailFrom = Math.max(from, to - limit);
            String content = String.join("\n", Arrays.copyOfRange(allLines, tailFrom, to));
            return new LogContracts.LogsResponse(true, content);
        } catch (IOException e) {
            log.error("Failed to read log file {}", logFile, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Не удалось прочитать лог-файл");
        }
    }

}
