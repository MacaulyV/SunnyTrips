package com.sunnytrips.sunnytrips.services;

import com.sunnytrips.sunnytrips.dtos.passeio.PasseioRequestDTO;
import com.sunnytrips.sunnytrips.dtos.passeio.PasseioResponseDTO;
import com.sunnytrips.sunnytrips.models.Passeio;
import com.sunnytrips.sunnytrips.models.Usuario;
import com.sunnytrips.sunnytrips.repositories.PasseioRepository;
import com.sunnytrips.sunnytrips.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Essa classe de serviço é responsável por toda a lógica de negócio relacionada aos passeios.
// Ela cuida de criar, atualizar, buscar e excluir os passeios no sistema,
// sempre garantindo que o código fique bem organizado e que as operações sejam feitas da forma correta.
@Service
public class PasseioService {

    // Injeção de dependências para termos acesso aos repositórios que lidam com os dados dos passeios e dos usuários.
    @Autowired
    private PasseioRepository passeioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Cria um novo passeio associado a um usuário específico.
    // Aqui, o método recebe os dados do passeio e o ID do usuário,
    // depois verifica se esse usuário existe no sistema e, se sim, associa o passeio a ele.
    public PasseioResponseDTO criarPasseio(PasseioRequestDTO dto, Long usuarioId) {
        // Tenta encontrar o usuário pelo id informado.
        Optional<Usuario> possivelUsuario = usuarioRepository.findById(usuarioId);
        if (!possivelUsuario.isPresent()) {
            // Se o usuário não for encontrado, joga uma exceção com uma mensagem bem clara.
            throw new RuntimeException("Usuário não encontrado para o id: " + usuarioId);
        }
        // Se o usuário existir, pega o objeto usuário.
        Usuario usuario = possivelUsuario.get();
        // Cria um novo objeto Passeio e preenche com os dados vindos do DTO.
        Passeio passeio = new Passeio();
        passeio.setLocalEspecifico(dto.getLocalEspecifico());
        passeio.setDataHora(dto.getDataHora());
        // Associa o usuário ao passeio, garantindo que a relação fique correta.
        passeio.setUsuario(usuario);
        // Salva o passeio no banco de dados.
        Passeio passeioSalvo = passeioRepository.save(passeio);
        // Converte a entidade para um DTO de resposta e retorna.
        return converterParaPasseioResponseDTO(passeioSalvo);
    }

    // Método para listar todos os passeios cadastrados.
    // Ele busca todos os passeios no banco e, em seguida, converte cada um deles para um DTO de resposta.
    public List<PasseioResponseDTO> listarTodosPasseios() {
        List<Passeio> passeios = passeioRepository.findAll();
        return passeios.stream()
                .map(this::converterParaPasseioResponseDTO)
                .collect(Collectors.toList());
    }

    // Método para buscar um passeio específico pelo seu ID.
    // Se o passeio for encontrado, ele é convertido em DTO de resposta; caso contrário, retorna um Optional vazio.
    public Optional<PasseioResponseDTO> buscarPasseioPorId(Long id) {
        return passeioRepository.findById(id)
                .map(this::converterParaPasseioResponseDTO);
    }

    // Atualiza um passeio existente. O ID do passeio não pode ser alterado, mas outros campos podem ser modificados.
    public Optional<PasseioResponseDTO> atualizarPasseio(Long id, PasseioRequestDTO dto) {
        Optional<Passeio> possivel = passeioRepository.findById(id);
        if (possivel.isPresent()) {
            // Se encontrar o passeio, atualiza seus campos com os novos valores.
            Passeio passeio = possivel.get();
            passeio.setLocalEspecifico(dto.getLocalEspecifico());
            passeio.setDataHora(dto.getDataHora());
            // Salva as alterações no banco.
            Passeio atualizado = passeioRepository.save(passeio);
            return Optional.of(converterParaPasseioResponseDTO(atualizado));
        }
        // Se o passeio não for encontrado, retorna Optional.empty()
        return Optional.empty();
    }

    // Exclui um passeio baseado no seu ID.
    // Esse método simplesmente chama o repositório para remover o registro do banco de dados.
    public void deletarPasseio(Long id) {
        passeioRepository.deleteById(id);
    }

    // Método auxiliar para converter a entidade Passeio em um DTO de resposta (PasseioResponseDTO).
    // Isso é importante para separar a estrutura interna do banco dos dados enviados para o cliente.
    private PasseioResponseDTO converterParaPasseioResponseDTO(Passeio passeio) {
        PasseioResponseDTO dto = new PasseioResponseDTO();
        dto.setId(passeio.getId());
        dto.setLocalEspecifico(passeio.getLocalEspecifico());
        dto.setDataHora(passeio.getDataHora());
        return dto;
    }
}
