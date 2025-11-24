CREATE DATABASE evora;
USE evora;

CREATE TABLE instituicao (
    id_instituicao INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    uf CHAR(2),
    cidade VARCHAR(100),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela Usuário (Professores, Admin)
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    fkInstituicao INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(50),
    ativo TINYINT(1) DEFAULT 1,
    CONSTRAINT fk_usuario_instituicao FOREIGN KEY (fkInstituicao) 
        REFERENCES instituicao(id_instituicao)
);

-- 4. Tabela Aluno (Independente)
CREATE TABLE aluno (
    ra INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela Curso
CREATE TABLE curso (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    fkInstituicao INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    modalidade VARCHAR(50),
    duracao_semestres INT,
    CONSTRAINT fk_curso_instituicao FOREIGN KEY (fkInstituicao) 
        REFERENCES instituicao(id_instituicao)
);

-- 6. Tabela Disciplina
CREATE TABLE disciplina (
    id_disciplina INT AUTO_INCREMENT PRIMARY KEY,
    fkInstituicao INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    CONSTRAINT fk_disciplina_instituicao FOREIGN KEY (fkInstituicao) 
        REFERENCES instituicao(id_instituicao)
);

-- 7. Tabela Grade Curricular (Curso <-> Disciplina)
CREATE TABLE grade_curricular (
    fkCurso INT NOT NULL,
    fkDisciplina INT NOT NULL,
    PRIMARY KEY (fkCurso, fkDisciplina),
    CONSTRAINT fk_grade_curso FOREIGN KEY (fkCurso) 
        REFERENCES curso(id_curso),
    CONSTRAINT fk_grade_disciplina FOREIGN KEY (fkDisciplina) 
        REFERENCES disciplina(id_disciplina)
);

-- 8. Tabela Turma
CREATE TABLE turma (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    fkCurso INT NOT NULL,
    nome_sigla VARCHAR(50),
    ano INT,
    semestre INT,
    periodo VARCHAR(20),
    CONSTRAINT fk_turma_curso FOREIGN KEY (fkCurso) 
        REFERENCES curso(id_curso)
);

-- 9. Tabela Usuario_Turma 
CREATE TABLE usuario_turma (
    id_usuario_turma INT AUTO_INCREMENT PRIMARY KEY,
    fkUsuario INT NOT NULL,
    fkTurma INT NOT NULL,
    fkDisciplina INT NOT NULL,
    dia_semana VARCHAR(45), 
    
    CONSTRAINT fk_ut_usuario FOREIGN KEY (fkUsuario) 
        REFERENCES usuario(id_usuario),
    CONSTRAINT fk_ut_turma FOREIGN KEY (fkTurma) 
        REFERENCES turma(id_turma),
    CONSTRAINT fk_ut_disciplina FOREIGN KEY (fkDisciplina) 
        REFERENCES disciplina(id_disciplina)
);

-- 10. Tabela Matrícula (Aluno <-> Turma)
CREATE TABLE matricula (
    id_matricula INT AUTO_INCREMENT PRIMARY KEY,
    fkAluno INT NOT NULL,
    fkTurma INT NOT NULL,
    data_matricula DATE,
    ativo TINYINT,
    data_atualizacao_status DATETIME,
    CONSTRAINT fk_matricula_aluno FOREIGN KEY (fkAluno) 
        REFERENCES aluno(ra),
    CONSTRAINT fk_matricula_turma FOREIGN KEY (fkTurma) 
        REFERENCES turma(id_turma)
);

CREATE TABLE Matricula (
    idMatricula INT NOT NULL,
    fkRA INT NOT NULL,
    Aluno_fkInstituicao INT NOT NULL,
    Curso_fkCurso INT NOT NULL,
    Curso_fkInstituicao INT NOT NULL,
    PRIMARY KEY (idMatricula, fkRA, Aluno_fkInstituicao, Curso_fkCurso, Curso_fkInstituicao),
    FOREIGN KEY (fkRA, Aluno_fkInstituicao)
        REFERENCES Aluno (RA, fkInstituicao),
    FOREIGN KEY (Curso_fkCurso, Curso_fkInstituicao)
        REFERENCES Curso (idCurso, fkInstituicao)
);

-- 12. Tabela Avaliação
CREATE TABLE avaliacao (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    fkMatricula INT NOT NULL,
    fkDisciplina INT NOT NULL,
    tipo VARCHAR(30),
    nota DECIMAL(5,2),
    data_avaliacao DATE,
    CONSTRAINT fk_avaliacao_matricula FOREIGN KEY (fkMatricula) 
        REFERENCES matricula(id_matricula),
    CONSTRAINT fk_avaliacao_disciplina FOREIGN KEY (fkDisciplina) 
        REFERENCES disciplina(id_disciplina)
);