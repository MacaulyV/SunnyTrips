package com.sunnytrips.sunnytrips.services;

import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioCompleteResponseDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioFullUpdateDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioRequestDTO;
import com.sunnytrips.sunnytrips.dtos.usuario.UsuarioResponseDTO;
import com.sunnytrips.sunnytrips.dtos.passeio.PasseioResponseDTO;
import com.sunnytrips.sunnytrips.dtos.viagem.ViagemResponseDTO;
import com.sunnytrips.sunnytrips.dtos.viagem.ViagemUpdateDTO;
import com.sunnytrips.sunnytrips.dtos.passeio.PasseioUpdateDTO;
import com.sunnytrips.sunnytrips.models.Passeio;
import com.sunnytrips.sunnytrips.models.Usuario;
import com.sunnytrips.sunnytrips.models.Viagem;
import com.sunnytrips.sunnytrips.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Essa classe é a responsável por toda a lógica de negócio relacionada aos usuários.
// Aqui a gente implementa métodos para criar, buscar, listar, atualizar e deletar usuários,
// além de converter nossas entidades para DTOs, para facilitar a comunicação com o front-end.
@Service
public class UsuarioService {

    // Injeção do repositório de usuários, que nos permite acessar o banco de dados.
    @Autowired
    private UsuarioRepository usuarioRepository;

    // Cria um novo usuário utilizando os dados enviados pelo DTO (dados básicos).
    // Aqui, a gente simplesmente preenche um objeto Usuario com os dados do DTO e salva no banco.
    public UsuarioResponseDTO salvarUsuario(UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setPais(dto.getPais());
        usuario.setEstado(dto.getEstado());
        usuario.setCidade(dto.getCidade());
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return converterParaResponseDTO(usuarioSalvo);
    }

    // Método auxiliar para converter a entidade Usuario para um DTO simples,
    // contendo os dados básicos que queremos enviar de volta para o cliente.
    public UsuarioResponseDTO converterParaResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPais(usuario.getPais());
        dto.setEstado(usuario.getEstado());
        dto.setCidade(usuario.getCidade());
        return dto;
    }

    // Converte a entidade Usuario para um DTO completo, que inclui também as associações de
    // viagens e passeios. Essa versão é útil quando o cliente precisa de todas as informações do usuário.
    public UsuarioCompleteResponseDTO converterParaUsuarioCompleteResponseDTO(Usuario usuario) {
        UsuarioCompleteResponseDTO dto = new UsuarioCompleteResponseDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setPais(usuario.getPais());
        dto.setEstado(usuario.getEstado());
        dto.setCidade(usuario.getCidade());
        // Converter cada viagem do usuário para um DTO de resposta de viagem.
        List<ViagemResponseDTO> viagensDto = usuario.getViagens()
                .stream()
                .map(viagem -> {
                    ViagemResponseDTO vDto = new ViagemResponseDTO();
                    vDto.setId(viagem.getId());
                    vDto.setPaisDestino(viagem.getPaisDestino());
                    vDto.setEstadoDestino(viagem.getEstadoDestino());
                    vDto.setCidadeDestino(viagem.getCidadeDestino());
                    vDto.setDataHora(viagem.getDataHora());
                    return vDto;
                })
                .collect(Collectors.toList());
        dto.setViagens(viagensDto);
        // Converter os passeios do usuário para um DTO de resposta de passeio.
        List<PasseioResponseDTO> passeiosDto = usuario.getPasseios()
                .stream()
                .map(passeio -> {
                    PasseioResponseDTO pDto = new PasseioResponseDTO();
                    pDto.setId(passeio.getId());
                    pDto.setLocalEspecifico(passeio.getLocalEspecifico());
                    pDto.setDataHora(passeio.getDataHora());
                    return pDto;
                })
                .collect(Collectors.toList());
        dto.setPasseios(passeiosDto);
        return dto;
    }

    // Retorna uma lista de todos os usuários cadastrados no banco, convertendo cada um para um DTO simples.
    public List<UsuarioResponseDTO> listarTodosDto() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarios.stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    // Busca um usuário completo pelo ID, incluindo suas viagens e passeios.
    // Utiliza o Optional para tratar o caso de o usuário não ser encontrado.
    public Optional<UsuarioCompleteResponseDTO> buscarUsuarioCompletoPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::converterParaUsuarioCompleteResponseDTO);
    }

    // Método para buscar um usuário pelo seu ID (retornando a entidade).
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // Deleta um usuário com base no ID.
    public void deletarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    // Atualização simples: atualiza os dados básicos do usuário sem alterar o ID.
    public Optional<UsuarioResponseDTO> atualizarUsuario(Long id, UsuarioRequestDTO dto) {
        Optional<Usuario> possivel = usuarioRepository.findById(id);
        if (possivel.isPresent()) {
            Usuario usuario = possivel.get();
            usuario.setNome(dto.getNome());
            usuario.setEmail(dto.getEmail());
            usuario.setSenha(dto.getSenha());
            usuario.setPais(dto.getPais());
            usuario.setEstado(dto.getEstado());
            usuario.setCidade(dto.getCidade());
            Usuario atualizado = usuarioRepository.save(usuario);
            return Optional.of(converterParaResponseDTO(atualizado));
        }
        return Optional.empty();
    }

    // Atualização completa: atualiza os dados básicos do usuário e também os registros
    // existentes de viagens e passeios. Aqui, o DTO de atualização completa traz as
    // alterações que devem ser feitas nos registros associados.
    public Optional<UsuarioCompleteResponseDTO> atualizarUsuarioCompleto(Long id, UsuarioFullUpdateDTO dto) {
        Optional<Usuario> possivel = usuarioRepository.findById(id);
        if (possivel.isPresent()) {
            Usuario usuario = possivel.get();
            // Atualiza os dados básicos do usuário. O ID permanece inalterado!
            usuario.setNome(dto.getNome());
            usuario.setEmail(dto.getEmail());
            usuario.setSenha(dto.getSenha());
            usuario.setPais(dto.getPais());
            usuario.setEstado(dto.getEstado());
            usuario.setCidade(dto.getCidade());

            // Atualiza as viagens já existentes.
            if (dto.getViagens() != null) {
                for (ViagemUpdateDTO viagemUpdate : dto.getViagens()) {
                    Optional<Viagem> viagemOpt = usuario.getViagens().stream()
                            .filter(v -> v.getId().equals(viagemUpdate.getId()))
                            .findFirst();
                    if (viagemOpt.isPresent()) {
                        Viagem viagem = viagemOpt.get();
                        // Não alteramos o ID da viagem, só os demais campos.
                        viagem.setPaisDestino(viagemUpdate.getPaisDestino());
                        viagem.setEstadoDestino(viagemUpdate.getEstadoDestino());
                        viagem.setCidadeDestino(viagemUpdate.getCidadeDestino());
                        viagem.setDataHora(viagemUpdate.getDataHora());
                    } else {
                        // Se a viagem não existir, lançamos uma exceção com uma mensagem bem legal.
                        throw new RuntimeException("Viagem com id " + viagemUpdate.getId() + " não encontrada para o usuário.");
                    }
                }
            }

            // Atualiza os passeios já existentes.
            if (dto.getPasseios() != null) {
                for (PasseioUpdateDTO passeioUpdate : dto.getPasseios()) {
                    Optional<Passeio> passeioOpt = usuario.getPasseios().stream()
                            .filter(p -> p.getId().equals(passeioUpdate.getId()))
                            .findFirst();
                    if (passeioOpt.isPresent()) {
                        Passeio passeio = passeioOpt.get();
                        // Novamente, o ID não é alterado; apenas os campos relevantes são atualizados.
                        passeio.setLocalEspecifico(passeioUpdate.getLocalEspecifico());
                        passeio.setDataHora(passeioUpdate.getDataHora());
                    } else {
                        // Se o passeio não for encontrado, jogamos uma exceção para avisar.
                        throw new RuntimeException("Passeio com id " + passeioUpdate.getId() + " não encontrado para o usuário.");
                    }
                }
            }
            // Salva o usuário atualizado no banco.
            Usuario atualizado = usuarioRepository.save(usuario);
            return Optional.of(converterParaUsuarioCompleteResponseDTO(atualizado));
        }
        return Optional.empty();
    }

    // Realiza o login validando o email e a senha.
    // Se as credenciais forem válidas, retorna o usuário; caso contrário, retorna null.
    public Usuario login(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmail(email);
        if (usuario != null && usuario.getSenha().equals(senha)) {
            return usuario;
        }
        return null;
    }
}
