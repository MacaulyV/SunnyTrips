package com.sunnytrips.sunnytrips.services;

import com.sunnytrips.sunnytrips.dtos.viagem.ViagemRequestDTO;
import com.sunnytrips.sunnytrips.dtos.viagem.ViagemResponseDTO;
import com.sunnytrips.sunnytrips.models.Usuario;
import com.sunnytrips.sunnytrips.models.Viagem;
import com.sunnytrips.sunnytrips.repositories.UsuarioRepository;
import com.sunnytrips.sunnytrips.repositories.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Essa classe é nosso serviço para lidar com tudo o que diz respeito às viagens.
// Aqui a gente encapsula a lógica de negócio, como criar, atualizar, buscar e deletar viagens.
@Service
public class ViagemService {

    // Injeção do repositório de viagens para acesso aos dados no banco.
    @Autowired
    private ViagemRepository viagemRepository;

    // Injeção do repositório de usuários para buscar o usuário que vai estar associado à viagem.
    @Autowired
    private UsuarioRepository usuarioRepository;

    // Cria uma nova viagem associada a um usuário específico.
    // O método recebe um DTO com os dados da viagem e o ID do usuário.
    public ViagemResponseDTO criarViagem(ViagemRequestDTO dto, Long usuarioId) {
        // Tenta encontrar o usuário no banco pelo ID fornecido.
        Optional<Usuario> possivelUsuario = usuarioRepository.findById(usuarioId);
        if (!possivelUsuario.isPresent()) {
            // Se o usuário não for encontrado, lance uma exceção com uma mensagem explicativa.
            throw new RuntimeException("Usuário não encontrado para o id: " + usuarioId);
        }
        // Se o usuário existir, pega o objeto usuário.
        Usuario usuario = possivelUsuario.get();

        // Cria um novo objeto Viagem e popula com os dados vindos do DTO.
        Viagem viagem = new Viagem();
        viagem.setPaisDestino(dto.getPaisDestino());
        viagem.setEstadoDestino(dto.getEstadoDestino());
        viagem.setCidadeDestino(dto.getCidadeDestino());
        viagem.setDataHora(dto.getDataHora());
        // Associa o usuário à viagem, garantindo que essa relação seja válida (conforme a validação @NotNull no modelo).
        viagem.setUsuario(usuario);

        // Salva a viagem no banco e armazena o retorno em viagemSalva.
        Viagem viagemSalva = viagemRepository.save(viagem);
        // Converte a entidade salva para um DTO de resposta e retorna para o cliente.
        return converterParaViagemResponseDTO(viagemSalva);
    }

    // Retorna todas as viagens cadastradas no sistema.
    // Esse método busca no banco todos os registros de viagens e os converte para DTOs.
    public List<ViagemResponseDTO> listarTodasViagens() {
        List<Viagem> viagens = viagemRepository.findAll();
        return viagens.stream()
                .map(this::converterParaViagemResponseDTO)
                .collect(Collectors.toList());
    }

    // Busca e retorna uma viagem pelo seu ID.
    // Se a viagem for encontrada, ela é convertida para um DTO de resposta, senão, retorna Optional.empty().
    public Optional<ViagemResponseDTO> buscarViagemPorId(Long id) {
        return viagemRepository.findById(id)
                .map(this::converterParaViagemResponseDTO);
    }

    // Atualiza os dados de uma viagem existente (o ID não pode ser alterado).
    // Busca a viagem pelo ID, atualiza os campos com os dados do DTO e salva a alteração.
    public Optional<ViagemResponseDTO> atualizarViagem(Long id, ViagemRequestDTO dto) {
        Optional<Viagem> possivel = viagemRepository.findById(id);
        if (possivel.isPresent()) {
            // Se a viagem existir, atualiza seus atributos com os novos valores.
            Viagem viagem = possivel.get();
            viagem.setPaisDestino(dto.getPaisDestino());
            viagem.setEstadoDestino(dto.getEstadoDestino());
            viagem.setCidadeDestino(dto.getCidadeDestino());
            viagem.setDataHora(dto.getDataHora());
            // A associação com o usuário permanece inalterada.
            Viagem atualizado = viagemRepository.save(viagem);
            // Converte o objeto atualizado para DTO e retorna.
            return Optional.of(converterParaViagemResponseDTO(atualizado));
        }
        // Se a viagem não for encontrada, retorna Optional.empty().
        return Optional.empty();
    }

    // Exclui uma viagem com base no ID fornecido.
    // Esse método simplesmente remove a viagem do banco de dados.
    public void deletarViagem(Long id) {
        viagemRepository.deleteById(id);
    }

    // Método auxiliar que converte uma entidade Viagem em um ViagemResponseDTO.
    // Essa conversão é feita para separar a representação interna do modelo dos dados enviados para o cliente.
    private ViagemResponseDTO converterParaViagemResponseDTO(Viagem viagem) {
        ViagemResponseDTO dto = new ViagemResponseDTO();
        dto.setId(viagem.getId());
        dto.setPaisDestino(viagem.getPaisDestino());
        dto.setEstadoDestino(viagem.getEstadoDestino());
        dto.setCidadeDestino(viagem.getCidadeDestino());
        dto.setDataHora(viagem.getDataHora());
        return dto;
    }
}
