package com.studyGroup.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studyGroup.backend.model.Course;


@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
   
}

