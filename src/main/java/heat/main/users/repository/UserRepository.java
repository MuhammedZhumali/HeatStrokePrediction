package heat.main.users.repository;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByRoleType(RoleType roleType);

    List<User> findByPhoneNumberAndRoleType(String phoneNumber, RoleType roleType);

    // case-insensitive поиск
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByNameIgnoreCase(String name);

    // удобный комбинированный поиск
    Optional<User> findByEmailIgnoreCaseOrNameIgnoreCase(String email, String name);

    // проверки на существование (для sign_up)
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByNameIgnoreCase(String name);
}
