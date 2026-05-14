package com.eramix.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
            "audio/mp4", "audio/m4a", "audio/mpeg", "audio/ogg", "audio/x-m4a",
            "audio/caf", "audio/x-caf", "audio/aac", "audio/wave", "audio/wav",
            "audio/x-wav", "audio/3gpp", "audio/amr", "audio/webm", "audio/opus",
            "audio/flac", "audio/mp3", "application/octet-stream"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path photosDir;
    private Path audiosDir;

    @PostConstruct
    public void init() {
        photosDir = Paths.get(uploadDir, "photos").toAbsolutePath().normalize();
        audiosDir = Paths.get(uploadDir, "audios").toAbsolutePath().normalize();
        try {
            Files.createDirectories(photosDir);
            Files.createDirectories(audiosDir);
            log.info("Upload directory ready: {}", photosDir);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de uploads", e);
        }
    }

    /**
     * Almacena un archivo de imagen y retorna la URL relativa (/uploads/photos/xxx.ext).
     */
    public String storePhoto(MultipartFile file) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String filename = UUID.randomUUID() + extension;

        try {
            Path target = photosDir.resolve(filename).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Foto almacenada: {}", target);
            return "/uploads/photos/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Error al almacenar el archivo", e);
        }
    }

    public String storeAudio(MultipartFile file) {
        validateAudio(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        // Fallback for m4a if it doesn't have an extension
        if (extension.equals(".jpg")) {
            extension = ".m4a"; 
        }
        String filename = UUID.randomUUID() + extension;

        try {
            Path target = audiosDir.resolve(filename).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Audio almacenado: {}", target);
            return "/uploads/audios/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Error al almacenar el archivo de audio", e);
        }
    }

    /**
     * Elimina un archivo dada su URL relativa.
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            // fileUrl example: /uploads/photos/xxx.jpg
            String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            Path filePath = photosDir.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            log.info("Foto eliminada: {}", filePath);
        } catch (IOException e) {
            log.warn("No se pudo eliminar el archivo: {}", fileUrl, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo excede el límite de 10 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Tipo de archivo no permitido. Permitidos: JPEG, PNG, WEBP");
        }
    }

    private void validateAudio(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo de audio está vacío");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El audio excede el límite de 10 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AUDIO_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Formato de audio no permitido: " + contentType);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
