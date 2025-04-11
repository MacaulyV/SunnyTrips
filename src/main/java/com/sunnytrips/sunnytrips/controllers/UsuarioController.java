package com.sunnytrips.sunnytrips.controllers;

// Aqui a gente importa todos os DTOs, modelos e serviços que vamos usar nesse controller.
// Basicamente, esses são os "ingredientes" para fazer os endpoints da API.
import com.sunnytrips.sunnytrips.dtos.auth.LoginRequestDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioCompleteResponseDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioFullUpdateDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioRequestDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioResponseDTO;
import com.sunnytrips.sunnytrips.models.Usuario;
import com.sunnytrips.sunnytrips.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

// Usando o @Tag para categorizar os endpoints de usuário na documentação do Swagger
@Tag(name = "0 - Usuários", description = "Endpoints para gerenciamento de usuários, incluindo um endpoint de atualização unificada que permite modificar tanto os dados do usuário quanto suas associações (viagens e passeios) em uma única operação.")
// Essa anotação define que essa classe é um controller REST, ou seja, ela expõe endpoints
@RestController
// Define a rota base para todos os endpoints definidos aqui, nesse caso, "usuarios"
@RequestMapping("/usuarios")
public class UsuarioController {

    // Aqui é a nossa dependência que cuida da lógica dos usuários. Vamos usar o serviço para salvar, buscar, atualizar e deletar usuários.
    private final UsuarioService usuarioService;

    // Construtor que recebe o UsuarioService. É injeção de dependência, que facilita os testes e o acoplamento.
    public UsuarioController(UsuarioService usuarioService) {
        // Atribuindo o serviço recebido para a variável interna.
        this.usuarioService = usuarioService;
    }

    // Endpoint para criar um novo usuário.
    @Operation(
            summary = "Cria um novo usuário",
            description = "Cria um usuário com as informações básicas. Exemplo de payload:\n\n" +
                    "{\n  \"nome\": \"João Silva\",\n  \"email\": \"joao.silva@example.com\",\n  \"senha\": \"senhaSegura123\",\n  \"pais\": \"Brasil\",\n  \"estado\": \"SP\",\n  \"cidade\": \"São Paulo\"\n}"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário criado com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content)
    })
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criarUsuario(
            // Aqui o Swagger descreve como o body da requisição deve ser formatado
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados do usuário a ser criado",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "{\n  \"nome\": \"João Silva\",\n  \"email\": \"joao.silva@example.com\",\n  \"senha\": \"senhaSegura123\",\n  \"pais\": \"Brasil\",\n  \"estado\": \"SP\",\n  \"cidade\": \"São Paulo\"\n}")
                    )
            )
            // Validação dos dados enviados, para garantir que estão corretos antes de processar
            @Valid @org.springframework.web.bind.annotation.RequestBody UsuarioRequestDTO dto) {
        // Chamando o serviço para salvar o usuário e guardando o resultado em novoUsuario
        UsuarioResponseDTO novoUsuario = usuarioService.salvarUsuario(dto);
        // Retornando o usuário criado com status 200 (OK)
        return ResponseEntity.ok(novoUsuario);
    }

    // Endpoint para listar todos os usuários
    @Operation(
            summary = "Lista todos os usuários",
            description = "Retorna uma lista com todos os usuários cadastrados (dados básicos)."
    )
    @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso", content = @Content)
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios() {
        // Pedindo ao serviço que retorne todos os usuários no formato DTO.
        List<UsuarioResponseDTO> usuarios = usuarioService.listarTodosDto();
        // Retornando a lista com status 200
        return ResponseEntity.ok(usuarios);
    }

    // Endpoint para buscar um usuário completo pelo ID, ou seja, com todas as suas associações (viagens, passeios, etc.)
    @Operation(
            summary = "Busca usuário completo por ID",
            description = "Retorna um usuário junto com suas associações (viagens e passeios) pelo ID.\nExemplo de resposta:\n{\n  \"id\": 323236,\n  \"nome\": \"João Silva\",\n  \"email\": \"joao.silva@example.com\",\n  \"pais\": \"Brasil\",\n  \"estado\": \"SP\",\n  \"cidade\": \"São Paulo\",\n  \"viagens\": [ ... ],\n  \"passeios\": [ ... ]\n}"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioCompleteResponseDTO> buscarUsuarioCompletoPorId(@PathVariable Long id) {
        // Tenta buscar o usuário completo pelo ID usando o serviço.
        Optional<UsuarioCompleteResponseDTO> possivel = usuarioService.buscarUsuarioCompletoPorId(id);
        // Se o usuário for encontrado, retorna ele com 200 (OK); se não, retorna 404 (not found)
        return possivel.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para atualizar um usuário com os dados básicos
    @Operation(
            summary = "Atualiza um usuário (dados básicos)",
            description = "Atualiza os dados básicos do usuário. O ID não pode ser alterado. Exemplo de payload:\n{\n  \"nome\": \"João Silva Atualizado\",\n  \"email\": \"joao.atualizado@example.com\",\n  \"senha\": \"novaSenha123\",\n  \"pais\": \"Brasil\",\n  \"estado\": \"SP\",\n  \"cidade\": \"São Paulo\"\n}"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(@PathVariable Long id,
                                                               // Swagger explica o body para atualização
                                                               @io.swagger.v3.oas.annotations.parameters.RequestBody(
                                                                       description = "Dados para atualização do usuário (dados básicos)",
                                                                       content = @Content(
                                                                               mediaType = "application/json",
                                                                               examples = @ExampleObject(value = "{\n  \"nome\": \"João Silva Atualizado\",\n  \"email\": \"joao.atualizado@example.com\",\n  \"senha\": \"novaSenha123\",\n  \"pais\": \"Brasil\",\n  \"estado\": \"SP\",\n  \"cidade\": \"São Paulo\"\n}")
                                                                       )
                                                               )
                                                               // Valida os dados enviados e garante que o payload esteja no formato certo
                                                               @Valid @org.springframework.web.bind.annotation.RequestBody UsuarioRequestDTO dto) {
        // Chama o serviço para atualizar o usuário e recebe um Optional, pois o usuário pode não ser encontrado
        Optional<UsuarioResponseDTO> atualizado = usuarioService.atualizarUsuario(id, dto);
        // Se o usuário foi atualizado com sucesso, retorna com 200; caso contrário, retorna 404
        return atualizado.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para atualizar completamente um usuário, incluindo associações (viagens e passeios)
    @Operation(
            summary = "Atualiza usuário completo",
            description = "Atualiza todos os dados do usuário, incluindo suas associações (viagens e passeios). O ID do usuário é informado na URL e não pode ser alterado. Exemplo de payload:\n{\n  \"nome\": \"João Silva Completo\",\n  \"email\": \"joao.completo@example.com\",\n  \"senha\": \"senhaCompleta123\",\n  \"pais\": \"Brasil\",\n  \"estado\": \"SP\",\n  \"cidade\": \"São Paulo\",\n  \"viagens\": [\n    { \"id\": 1, \"paisDestino\": \"Argentina\", \"estadoDestino\": \"Buenos Aires\", \"cidadeDestino\": \"Buenos Aires\", \"dataHora\": \"2025-05-10T14:30:00\" }\n  ],\n  \"passeios\": [\n    { \"id\": 2, \"localEspecifico\": \"Parque Ibirapuera\", \"dataHora\": \"2025-07-20T09:30:00\" }\n  ]\n}"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
    @PutMapping("/{id}/full")
    public ResponseEntity<UsuarioCompleteResponseDTO> atualizarUsuarioCompleto(
            @PathVariable Long id,
            // Detalhando como deve ser o payload completo para atualizar o usuário, incluindo suas viagens e passeios
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados para atualização completa do usuário, incluindo viagens e passeios",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = "{\n  \"nome\": \"João Silva Completo\",\n  \"email\": \"joao.completo@example.com\",\n  \"senha\": \"senhaCompleta123\",\n  \"pais\": \"Brasil\",\n  \"estado\": \"SP\",\n  \"cidade\": \"São Paulo\",\n  \"viagens\": [\n    { \"id\": 1, \"paisDestino\": \"Argentina\", \"estadoDestino\": \"Buenos Aires\", \"cidadeDestino\": \"Buenos Aires\", \"dataHora\": \"2025-05-10T14:30:00\" }\n  ],\n  \"passeios\": [\n    { \"id\": 2, \"localEspecifico\": \"Parque Ibirapuera\", \"dataHora\": \"2025-07-20T09:30:00\" }\n  ]\n}"
                            )
                    )
            )
            // Valida o objeto recebido no body, garantindo que ele esteja no formato certo para uma atualização completa
            @Valid @org.springframework.web.bind.annotation.RequestBody UsuarioFullUpdateDTO dto) {
        // Chama o serviço para atualizar completamente o usuário e recebe um Optional, pois pode não encontrar o usuário
        Optional<UsuarioCompleteResponseDTO> atualizado = usuarioService.atualizarUsuarioCompleto(id, dto);
        // Se o usuário foi atualizado, retorna ele com status 200; se não, retorna 404
        return atualizado.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Endpoint para deletar um usuário, basicamente remove os dados do usuário do sistema
    @Operation(
            summary = "Exclui um usuário",
            description = "Remove um usuário pelo ID."
    )
    @ApiResponse(responseCode = "204", description = "Usuário removido com sucesso", content = @Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        // Chama o serviço para deletar o usuário a partir do ID informado
        usuarioService.deletarUsuario(id);
        // Retorna um status 204 (no content) para indicar que o usuário foi removido com sucesso
        return ResponseEntity.noContent().build();
    }

    // Endpoint para realizar o login do usuário, ou seja, validar as credenciais fornecidas
    @Operation(
            summary = "Realiza login",
            description = "Valida as credenciais do usuário (email e senha) e retorna a mensagem 'Logou com Sucesso' em caso de sucesso. Exemplo de payload:\n{\n  \"email\": \"joao.silva@example.com\",\n  \"senha\": \"senhaSegura123\"\n}"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logou com Sucesso", content = @Content),
            @ApiResponse(responseCode = "401", description = "Email ou senha inválidos", content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<String> login(
            // Descrevendo o payload esperado para o login com exemplo no Swagger
            @Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Credenciais para login",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "{\n  \"email\": \"joao.silva@example.com\",\n  \"senha\": \"senhaSegura123\"\n}")
                    )
            )
            // Indica que os dados virão no corpo da requisição
            @org.springframework.web.bind.annotation.RequestBody LoginRequestDTO loginDto,
            HttpSession session) {
        // Chama o serviço de login passando email e senha, e guarda o usuário retornado (caso as credenciais estejam corretas)
        Usuario usuario = usuarioService.login(loginDto.getEmail(), loginDto.getSenha());
        // Se o usuário existir (ou seja, se as credenciais estiverem válidas), retorna mensagem de sucesso
        if (usuario != null) {
            // Armazena o ID do usuário na sessão, não o objeto completo
            session.setAttribute("usuario", usuario);
            return ResponseEntity.ok("Logou com Sucesso");
        }
        // Se não encontrar o usuário, retorna status 401 com mensagem de erro
        return ResponseEntity.status(401).body("Email ou senha inválidos");
    }
}
