package com.sunnytrips.sunnytrips.repositories;

import com.sunnytrips.sunnytrips.models.Passeio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Essa interface é o repositório responsável por gerenciar os dados dos passeios no banco de dados.
// A gente estende o JpaRepository, que já traz vários métodos prontos para persistir, buscar, deletar, etc.
@Repository
public interface PasseioRepository extends JpaRepository<Passeio, Long> {

    // Esse método permite buscar todos os passeios associados a um determinado usuário, utilizando o ID do usuário.
    // Assim, conseguimos filtrar os passeios de acordo com quem os criou ou a quem estão relacionados.
    List<Passeio> findByUsuarioId(Long usuarioId);
}
