package com.sunnytrips.sunnytrips.dtos.usuario;

import com.sunnytrips.sunnytrips.dtos.passeio.PasseioResponseDTO;
import com.sunnytrips.sunnytrips.dtos.viagem.ViagemResponseDTO;
import java.util.List;

// Esse DTO de resposta completo é usado quando precisamos enviar todos os dados do usuário
// junto com as suas viagens e passeios relacionados. Assim, fica bem fácil para o front-end
// exibir todas as informações de uma vez.
public class UsuarioCompleteResponseDTO {

    // Armazena o ID único do usuário.
    private Long id;

    // Nome do usuário, que ajuda a identificar quem é quem.
    private String nome;

    // Email do usuário, que pode ser usado para logins e comunicação.
    private String email;

    // País de residência do usuário.
    private String pais;

    // Estado onde o usuário mora.
    private String estado;

    // Cidade do usuário.
    private String cidade;

    // Lista de viagens associadas ao usuário, para mostrar histórico ou próximas viagens.
    private List<ViagemResponseDTO> viagens;

    // Lista de passeios do usuário, assim podemos mostrar todas as atividades planejadas.
    private List<PasseioResponseDTO> passeios;

    // Getters e Setters

    // Retorna o ID do usuário.
    public Long getId() {
        return id;
    }

    // Define ou atualiza o ID do usuário.
    public void setId(Long id) {
        this.id = id;
    }

    // Retorna o nome do usuário.
    public String getNome() {
        return nome;
    }

    // Define ou atualiza o nome do usuário.
    public void setNome(String nome) {
        this.nome = nome;
    }

    // Retorna o email do usuário.
    public String getEmail() {
        return email;
    }

    // Define ou atualiza o email do usuário.
    public void setEmail(String email) {
        this.email = email;
    }

    // Retorna o país do usuário.
    public String getPais() {
        return pais;
    }

    // Define ou atualiza o país.
    public void setPais(String pais) {
        this.pais = pais;
    }

    // Retorna o estado do usuário.
    public String getEstado() {
        return estado;
    }

    // Define ou atualiza o estado.
    public void setEstado(String estado) {
        this.estado = estado;
    }

    // Retorna a cidade do usuário.
    public String getCidade() {
        return cidade;
    }

    // Define ou atualiza a cidade do usuário.
    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    // Retorna a lista de viagens que o usuário tem associada.
    public List<ViagemResponseDTO> getViagens() {
        return viagens;
    }

    // Define ou atualiza a lista de viagens.
    public void setViagens(List<ViagemResponseDTO> viagens) {
        this.viagens = viagens;
    }

    // Retorna a lista de passeios associados ao usuário.
    public List<PasseioResponseDTO> getPasseios() {
        return passeios;
    }

    // Define ou atualiza a lista de passeios.
    public void setPasseios(List<PasseioResponseDTO> passeios) {
        this.passeios = passeios;
    }
}
