package com.sunnytrips.sunnytrips.controllers;

// Importando os DTOs e o serviço que serão usados para trabalhar com as viagens
import com.sunnytrips.sunnytrips.dtos.viagem.ViagemRequestDTO;
import com.sunnytrips.sunnytrips.dtos.viagem.ViagemResponseDTO;
import com.sunnytrips.sunnytrips.services.ViagemService;

// Importações para configurar a documentação da API com o Swagger, ajudando a deixar tudo mais claro
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

// Usando @Tag para categorizar esses endpoints como parte do gerenciamento de viagens na documentação do Swagger
@Tag(name = "1 - Viagens", description = "Endpoints para gerenciamento de viagens")

// Essa anotação diz pro Spring que essa classe vai ser um controller REST, ou seja, vai expor endpoints via HTTP
@RestController
// Define o caminho base para as requisições que essa classe vai lidar
@RequestMapping("/viagens")
public class ViagemController {

    // Declarando a dependência do serviço que lida com as operações de viagem
    private final ViagemService viagemService;

    // Construtor para injeção do serviço. Assim, o Spring já injeta uma instância da nossa classe de serviço aqui.
    public ViagemController(ViagemService viagemService) {
        // Atribuindo o serviço injetado para que a gente possa usar nos endpoints
        this.viagemService = viagemService;
    }

    // Endpoint que cria uma nova viagem
    @Operation(
            summary = "Cria uma nova viagem",
            description = "Cria uma viagem e associa-a a um usuário. O usuário deve ser informado via parâmetro 'usuarioId'."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Viagem criada com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content)
    })
    @PostMapping
    public ResponseEntity<ViagemResponseDTO> criarViagem(
            // Aqui a documentação do Swagger explica como deve ser o corpo da requisição para criação da viagem
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados da viagem a ser criada",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = "{\n  \"paisDestino\": \"Argentina\",\n  \"estadoDestino\": \"Buenos Aires\",\n  \"cidadeDestino\": \"Buenos Aires\",\n  \"dataHora\": \"2025-05-10T14:30:00\"\n}"
                            )
                    )
            )
            // Validação do objeto para garantir que os dados estão corretos
            @Valid
            // Indica que esse objeto vem do corpo da requisição
            @org.springframework.web.bind.annotation.RequestBody ViagemRequestDTO dto,
            // Recebendo o parâmetro "usuarioId" via query para associar a viagem a um usuário específico
            @RequestParam Long usuarioId) {
        // Chama o serviço para criar a viagem e guarda o resultado
        ViagemResponseDTO novaViagem = viagemService.criarViagem(dto, usuarioId);
        // Retorna a viagem criada com o status 200 (OK)
        return ResponseEntity.ok(novaViagem);
    }

    // Endpoint para listar todas as viagens cadastradas
    @Operation(
            summary = "Lista todas as viagens",
            description = "Retorna todas as viagens cadastradas na base."
    )
    @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso", content = @Content)
    @GetMapping
    public ResponseEntity<List<ViagemResponseDTO>> listarViagens() {
        // Pede para o serviço buscar todas as viagens cadastradas
        List<ViagemResponseDTO> viagens = viagemService.listarTodasViagens();
        // Retorna a lista com status 200
        return ResponseEntity.ok(viagens);
    }

    // Endpoint para buscar uma viagem específica pelo ID
    @Operation(
            summary = "Busca viagem por ID",
            description = "Retorna uma viagem específica pelo seu ID."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Viagem encontrada"),
            @ApiResponse(responseCode = "404", description = "Viagem não encontrada", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> buscarViagemPorId(@PathVariable Long id) {
        // Usa o serviço para buscar uma viagem pelo ID e guarda o resultado em um Optional
        Optional<ViagemResponseDTO> possivel = viagemService.buscarViagemPorId(id);
        // Se a viagem for encontrada, retorna ela com status 200, se não, retorna 404 (not found)
        return possivel.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para atualizar os dados de uma viagem existente (o ID não deve ser alterado)
    @Operation(
            summary = "Atualiza uma viagem",
            description = "Atualiza os dados de uma viagem existente. O ID da viagem não pode ser alterado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Viagem atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Viagem não encontrada", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> atualizarViagem(@PathVariable Long id,
                                                             // Explicação via Swagger de como deve ser o payload para atualizar a viagem
                                                             @io.swagger.v3.oas.annotations.parameters.RequestBody(
                                                                     description = "Dados para atualização da viagem",
                                                                     content = @Content(
                                                                             mediaType = "application/json",
                                                                             examples = @ExampleObject(
                                                                                     value = "{\n  \"paisDestino\": \"Brasil\",\n  \"estadoDestino\": \"São Paulo\",\n  \"cidadeDestino\": \"São Paulo\",\n  \"dataHora\": \"2025-06-15T15:00:00\"\n}"
                                                                             )
                                                                     )
                                                             )
                                                             // Validação dos dados enviados
                                                             @Valid
                                                             // Indica que esse DTO vem no corpo da requisição
                                                             @org.springframework.web.bind.annotation.RequestBody ViagemRequestDTO dto) {
        // Chama o serviço para atualizar a viagem usando o ID e os novos dados
        Optional<ViagemResponseDTO> atualizado = viagemService.atualizarViagem(id, dto);
        // Se a viagem foi encontrada e atualizada, retorna com 200; se não, retorna 404
        return atualizado.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para deletar uma viagem pelo ID
    @Operation(
            summary = "Exclui uma viagem",
            description = "Exclui uma viagem pelo seu ID."
    )
    @ApiResponse(responseCode = "204", description = "Viagem removida com sucesso", content = @Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarViagem(@PathVariable Long id) {
        // Chama o serviço para deletar a viagem a partir do ID fornecido
        viagemService.deletarViagem(id);
        // Retorna um status 204 (no content) indicando que a viagem foi removida com sucesso
        return ResponseEntity.noContent().build();
    }
}
