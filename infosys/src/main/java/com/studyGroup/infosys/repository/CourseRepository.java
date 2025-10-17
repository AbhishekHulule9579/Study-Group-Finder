package com.studyGroup.infosys.repository;

import com.studyGroup.infosys.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findByUsers_Id(Integer userId);
}
