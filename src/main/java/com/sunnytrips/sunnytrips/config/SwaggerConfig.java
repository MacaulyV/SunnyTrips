package com.sunnytrips.sunnytrips.config;

// Importando as classes necessárias para configurar a documentação da API com Swagger
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

// Essa anotação indica para o Spring que essa classe é uma configuração
@Configuration
public class SwaggerConfig {

    // Aqui estou definindo um bean que vai ser gerenciado pelo Spring. Esse bean é uma instância do OpenAPI
    // que configura a documentação da nossa API
    @Bean
    public OpenAPI customOpenAPI() {
        // Estou criando um novo objeto OpenAPI e configurando ele com as informações da API
        return new OpenAPI()
                // Aqui adiciono as informações básicas da API, como título, versão e descrição
                .info(new Info()
                        .title("SunnyTrips API") // Título da API, fácil de identificar
                        .version("1.0.0") // Versão atual da API, importante para controle de mudanças e atualizações
                        // Descrição detalhada da API para que os desenvolvedores saibam o que esperar
                        .description("API para gerenciamento de usuários, viagens e passeios do projeto SunnyTrips.\n\n"
                                + "Esta documentação detalha todos os endpoints, parâmetros, exemplos de payload e possíveis mensagens de erro.")
                        // Link para os termos de serviço, caso alguém queira saber mais sobre as condições de uso
                        .termsOfService("http://sunnytrips.com/terms")
                        // Dados de contato da equipe responsável pela API, pra facilitar dúvidas e suporte
                        .contact(new Contact()
                                .name("Equipe SunnyTrips")
                                .email("suporte@sunnytrips.com")
                                .url("http://sunnytrips.com"))
                        // Informações sobre a licença que regula o uso da API
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://sunnytrips.com/license")))
                // Configurando a documentação externa, que pode ter informações complementares sobre a API
                .externalDocs(new ExternalDocumentation()
                        .description("Documentação Complementar")
                        .url("http://sunnytrips.com/docs"));
    }

    // Esse método é útil para determinar a ordem dos "tags" (categorias) baseadas em um array de ordem definido previamente.
    // É uma função privada, usada apenas dentro dessa classe, para ajudar na organização da documentação.
    private int indexOfTag(String tagName, String[] order) {
        // Loop que passa por cada posição do array 'order' para comparar com o nome da tag
        for (int i = 0; i < order.length; i++) {
            // Aqui comparo ignorando se for maiúscula ou minúscula pra facilitar a comparação
            if (order[i].equalsIgnoreCase(tagName)) {
                // Se encontrar a tag, retorna a posição dela
                return i;
            }
        }
        // Se a tag não for encontrada, retorna um valor bem alto para que ela fique no final da ordenação
        return Integer.MAX_VALUE;
    }
}
