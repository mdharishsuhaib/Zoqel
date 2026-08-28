package com.zoqel.workspace;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "workspaces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workspace {
    @Id
    private String id;
    private String name;
    private String businessType;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
