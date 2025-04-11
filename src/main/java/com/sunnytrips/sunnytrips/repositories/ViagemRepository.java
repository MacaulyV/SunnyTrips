package com.sunnytrips.sunnytrips.repositories;

import com.sunnytrips.sunnytrips.models.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Esse repositório é responsável por gerenciar as operações com o modelo Viagem no banco de dados.
// Ao estender o JpaRepository, já herdamos vários métodos prontos para realizar CRUD, o que facilita muito nosso trabalho.
@Repository
public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    // Método customizado para buscar todas as viagens associadas a um usuário específico.
    // Usamos o id do usuário para filtrar os registros, o que é super útil para mostrar apenas as viagens
    // que pertencem a um determinado usuário.
    List<Viagem> findByUsuarioId(Long usuarioId);
}
