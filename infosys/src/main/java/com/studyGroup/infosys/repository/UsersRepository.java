package com.studyGroup.infosys.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.studyGroup.infosys.entity.User;

@Repository
public interface UsersRepository extends JpaRepository<User, String>
{
	@Query("select count(U) from User U where U.email=:email" )
	public int validateEmail(@Param("email") String email); 	
	
	@Query("select count(U) from User U where U.email=:email and U.password=:password")
	public int validatecredentials(@Param("email")String email,@Param("password") String passwod);

}
