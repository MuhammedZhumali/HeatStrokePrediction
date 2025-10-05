package heat.main.users.repository;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findById(Long id);

    List<User> findByRoleType(RoleType roleType);
    
    List<User> findByPhoneNumberAndRoleType(String phoneNumber, RoleType roleType);
}
