package com.sunnytrips.sunnytrips;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Essa é a classe principal da aplicação SunnyTrips.
// A anotação @SpringBootApplication habilita várias configurações automáticas do Spring Boot,
// facilitando bastante a configuração e execução da aplicação.
// Aqui iniciamos a aplicação com o método main, que é o ponto de entrada padrão.
@SpringBootApplication
public class SunnyTripsApplication {

    public static void main(String[] args) {
        // Aqui a gente executa a aplicação passando os argumentos recebidos do sistema.
        // O SpringApplication.run vai iniciar o nosso servidor e preparar todos os componentes do Spring Boot.
        SpringApplication.run(SunnyTripsApplication.class, args);
    }
}
