package com.eramix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EramixApplication {

	public static void main(String[] args) {
		SpringApplication.run(EramixApplication.class, args);
	}

}
