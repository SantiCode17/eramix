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
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path photosDir;

    @PostConstruct
    public void init() {
        photosDir = Paths.get(uploadDir, "photos").toAbsolutePath().normalize();
        try {
            Files.createDirectories(photosDir);
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
            throw new IllegalArgumentException("El archivo excede el límite de 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Tipo de archivo no permitido. Permitidos: JPEG, PNG, WEBP");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
