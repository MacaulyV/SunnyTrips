package com.sunnytrips.sunnytrips.controllers;

// Importando os DTOs e o serviço de passeio para manipular as operações do nosso endpoint
import com.sunnytrips.sunnytrips.dtos.passeio.PasseioRequestDTO;
import com.sunnytrips.sunnytrips.dtos.passeio.PasseioResponseDTO;
import com.sunnytrips.sunnytrips.services.PasseioService;

// Importando anotações e classes para configuração da documentação da API com Swagger
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// Essa anotação serve para organizar os endpoints na documentação (swagger)
// Aqui estamos separando os endpoints relacionados aos passeios
@Tag(name = "2 - Passeios", description = "Endpoints para gerenciamento de passeios")

// Indica que essa classe é um controller REST, logo ela vai lidar com as requisições HTTP
@RestController
// Define o caminho base para todos os endpoints dessa classe
@RequestMapping("/passeios")
public class PasseioController {

    // Declarando uma dependência que vai gerenciar as lógicas de negócio dos passeios
    private final PasseioService passeioService;

    // Construtor para injetar o serviço via dependency injection
    public PasseioController(PasseioService passeioService) {
        // Aqui estou apenas atribuindo o serviço injetado para usar nos métodos do controller
        this.passeioService = passeioService;
    }

    // Endpoint para criar um novo passeio
    @Operation(
            summary = "Cria um novo passeio",
            description = "Cria um passeio e associa-o a um usuário. O usuário deve ser informado via parâmetro 'usuarioId'."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Passeio criado com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content)
    })
    @PostMapping
    public ResponseEntity<PasseioResponseDTO> criarPasseio(
            // Aqui o swagger explica o que deve ser enviado no corpo da requisição
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados do passeio a ser criado",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = "{\n  \"localEspecifico\": \"Parque Ibirapuera\",\n  \"dataHora\": \"2025-07-20T09:30:00\"\n}"
                            )
                    )
            )
            @Valid
            // Essa anotação do Spring indica que esse objeto vem do corpo da requisição
            @org.springframework.web.bind.annotation.RequestBody PasseioRequestDTO dto,
            // Esse parâmetro é passado via query string e indica o ID do usuário associado ao passeio
            @RequestParam Long usuarioId) {
        // Chama o serviço que cria o passeio e guarda o resultado na variável novoPasseio
        PasseioResponseDTO novoPasseio = passeioService.criarPasseio(dto, usuarioId);
        // Retorna o passeio criado com status 200 (OK)
        return ResponseEntity.ok(novoPasseio);
    }

    // Endpoint para listar todos os passeios cadastrados
    @Operation(
            summary = "Lista todos os passeios",
            description = "Retorna todos os passeios cadastrados na base."
    )
    @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso", content = @Content)
    @GetMapping
    public ResponseEntity<List<PasseioResponseDTO>> listarPasseios() {
        // Aqui pego a lista de passeios através do serviço
        List<PasseioResponseDTO> passeios = passeioService.listarTodosPasseios();
        // Retorno a lista com status 200 (OK)
        return ResponseEntity.ok(passeios);
    }

    // Endpoint para buscar um passeio específico pelo seu ID
    @Operation(
            summary = "Busca passeio por ID",
            description = "Retorna um passeio específico pelo seu ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Passeio encontrado"),
            @ApiResponse(responseCode = "404", description = "Passeio não encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<PasseioResponseDTO> buscarPasseioPorId(@PathVariable Long id) {
        // Tenta buscar o passeio pelo ID utilizando o serviço. Como pode não encontrar, ele retorna um Optional.
        Optional<PasseioResponseDTO> possivel = passeioService.buscarPasseioPorId(id);
        // Se o passeio existir, retorna ele com status 200; se não, retorna 404 (not found)
        return possivel.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para atualizar os dados de um passeio existente
    @Operation(
            summary = "Atualiza um passeio",
            description = "Atualiza os dados de um passeio existente. O ID não é alterado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Passeio atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Passeio não encontrado", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<PasseioResponseDTO> atualizarPasseio(@PathVariable Long id,
                                                               // Explicação do swagger sobre o que é esperado no corpo da requisição para a atualização
                                                               @io.swagger.v3.oas.annotations.parameters.RequestBody(
                                                                       description = "Dados para atualização do passeio",
                                                                       content = @Content(
                                                                               mediaType = "application/json",
                                                                               examples = @ExampleObject(
                                                                                       value = "{\n  \"localEspecifico\": \"Museu do Ipiranga\",\n  \"dataHora\": \"2025-08-10T10:00:00\"\n}"
                                                                               )
                                                                       )
                                                               )
                                                               @Valid
                                                               @org.springframework.web.bind.annotation.RequestBody PasseioRequestDTO dto) {
        // Usa o serviço para atualizar o passeio. Pode acontecer de não encontrar o passeio pelo ID informado.
        Optional<PasseioResponseDTO> atualizado = passeioService.atualizarPasseio(id, dto);
        // Se a atualização ocorreu, retorna o passeio atualizado; caso contrário, retorna 404 (not found)
        return atualizado.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para deletar um passeio existente
    @Operation(
            summary = "Exclui um passeio",
            description = "Remove um passeio pelo seu ID."
    )
    @ApiResponse(responseCode = "204", description = "Passeio removido com sucesso", content = @Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPasseio(@PathVariable Long id) {
        // Chama o método no serviço para deletar o passeio pelo ID fornecido
        passeioService.deletarPasseio(id);
        // Retorna 204 (no content), indicando que a remoção foi bem sucedida sem retornar conteúdo
        return ResponseEntity.noContent().build();
    }
}
