package heat.main.users.service;

import heat.main.domain.User;
import heat.main.enums.RoleType;

import java.util.List;
import java.util.Optional;

public interface UserSerivce {
    List<User> getAllUsers();
    List<User> getAllUsersByRole(RoleType roleType);
    Optional<User> findUserById(Long id);
    List<User> findUserByPhoneAndRole(String phone, RoleType roleType);
    User addUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);

    Optional<User> findUserByEmail(String email);
//    Optional<User> findUserByName(String name);

    // новый метод
    Optional<User> findByNameOrEmail(String value);

    User updateOwnProfile(Long id, User user);
}
