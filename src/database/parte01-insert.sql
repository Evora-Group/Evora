-- Instituições
INSERT INTO instituicao (nome, uf, cidade) VALUES
('Instituto Evora', 'SP', 'São Paulo'),
('Faculdade Aurora', 'RJ', 'Rio de Janeiro');

-- Usuários
INSERT INTO usuario (fkInstituicao,nome,email,senha_hash,cargo) VALUES
(1,'Carlos Admin','admin.evora@evora.com','hash123','Admin'),
(1,'Maria Professora','prof.evora@evora.com','hash456','Professor'),
(2,'João Admin','admin.aurora@aurora.com','hash789','Admin'),
(2,'Ana Professora','prof.aurora@aurora.com','hash321','Professor');

-- Cursos
INSERT INTO curso (fkInstituicao,nome,descricao,modalidade,duracao_semestres) VALUES
(1,'Engenharia de Software','Curso voltado para desenvolvimento de sistemas','Presencial',8),
(1,'Administração','Gestão de empresas e negócios','Presencial',8),
(1,'Design Gráfico','Criação e comunicação visual','EAD',6),
(2,'Ciência da Computação','Fundamentos da computação e IA','Presencial',8),
(2,'Direito','Formação jurídica completa','Presencial',10),
(2,'Marketing Digital','Gestão de mídias e campanhas online','EAD',6);

-- Disciplinas
INSERT INTO disciplina (fkInstituicao,nome,descricao) VALUES
(1,'Programação I','Lógica e algoritmos'),
(1,'Banco de Dados','Modelagem e SQL'),
(1,'Teoria da Administração','Fundamentos administrativos'),
(1,'Contabilidade','Gestão financeira'),
(1,'Tipografia','Estudo das fontes'),
(1,'Ilustração Digital','Ferramentas gráficas'),
(2,'Algoritmos Avançados','Estruturas de dados complexas'),
(2,'Inteligência Artificial','Redes neurais e aprendizado'),
(2,'Direito Civil','Normas e contratos'),
(2,'Direito Penal','Leis criminais'),
(2,'SEO e Analytics','Otimização de sites'),
(2,'Gestão de Conteúdo','Planejamento digital');

-- Grade Curricular
INSERT INTO grade_curricular VALUES
(1,1),(1,2),
(2,3),(2,4),
(3,5),(3,6),
(4,7),(4,8),
(5,9),(5,10),
(6,11),(6,12);

-- Turmas
INSERT INTO turma (fkCurso,nome_sigla,ano,semestre,periodo) VALUES
(1,'ES-2025-2',2025,2,'Matutino'),
(2,'ADM-2025-2',2025,2,'Noturno'),
(3,'DG-2025-2',2025,2,'EAD'),
(4,'CC-2025-2',2025,2,'Matutino'),
(5,'DIR-2025-2',2025,2,'Noturno'),
(6,'MK-2025-2',2025,2,'EAD');

-- Alunos (exemplo: 10 por curso)
INSERT INTO aluno (ra,nome,email,telefone) VALUES
(1001,'Aluno ES1','es1@evora.com','1111-1111'),
(1002,'Aluno ES2','es2@evora.com','1111-1112'),
(1003,'Aluno ES3','es3@evora.com','1111-1113'),
(1004,'Aluno ES4','es4@evora.com','1111-1114'),
(1005,'Aluno ES5','es5@evora.com','1111-1115'),
(1006,'Aluno ES6','es6@evora.com','1111-1116'),
(1007,'Aluno ES7','es7@evora.com','1111-1117'),
(1008,'Aluno ES8','es8@evora.com','1111-1118'),
(1009,'Aluno ES9','es9@evora.com','1111-1119'),
(1010,'Aluno ES10','es10@evora.com','1111-1120'),
(2001,'Aluno ADM1','adm1@evora.com','2222-1111'),
(2002,'Aluno ADM2','adm2@evora.com','2222-1112'),
(2003,'Aluno ADM3','adm3@evora.com','2222-1113'),
(2004,'Aluno ADM4','adm4@evora.com','2222-1114'),
(2005,'Aluno ADM5','adm5@evora.com','2222-1115'),
(2006,'Aluno ADM6','adm6@evora.com','2222-1116'),
(2007,'Aluno ADM7','adm7@evora.com','2222-1117'),
(2008,'Aluno ADM8','adm8@evora.com','2222-1118'),
(2009,'Aluno ADM9','adm9@evora.com','2222-1119'),
(2010,'Aluno ADM10','adm10@evora.com','2222-1120'),
(3001,'Aluno DG1','dg1@evora.com','3333-1111'),
(3002,'Aluno DG2','dg2@evora.com','3333-1112'),
(3003,'Aluno DG3','dg3@evora.com','3333-1113'),
(3004,'Aluno DG4','dg4@evora.com','3333-1114'),
(3005,'Aluno DG5','dg5@evora.com','3333-1115'),
(3006,'Aluno DG6','dg6@evora.com','3333-1116'),
(3007,'Aluno DG7','dg7@evora.com','3333-1117'),
(3008,'Aluno DG8','dg8@evora.com','3333-1118'),
(3009,'Aluno DG9','dg9@evora.com','3333-1119'),
(3010,'Aluno DG10','dg10@evora.com','3333-1120'),
(4001,'Aluno CC1','cc1@aurora.com','4444-1111'),
(4002,'Aluno CC2','cc2@aurora.com','4444-1112'),
(4003,'Aluno CC3','cc3@aurora.com','4444-1113'),
(4004,'Aluno CC4','cc4@aurora.com','4444-1114'),
(4005,'Aluno CC5','cc5@aurora.com','4444-1115'),
(4006,'Aluno CC6','cc6@aurora.com','4444-1116'),
(4007,'Aluno CC7','cc7@aurora.com','4444-1117'),
(4008,'Aluno CC8','cc8@aurora.com','4444-1118'),
(4009,'Aluno CC9','cc9@aurora.com','4444-1119'),
(4010,'Aluno CC10','cc10@aurora.com','4444-1120'),
(5001,'Aluno DIR1','dir1@aurora.com','5555-1111'),
(5002,'Aluno DIR2','dir2@aurora.com','5555-1112'),
(5003,'Aluno DIR3','dir3@aurora.com','5555-1113'),
(5004,'Aluno DIR4','dir4@aurora.com','5555-1114'),
(5005,'Aluno DIR5','dir5@aurora.com','5555-1115'),
(5006,'Aluno DIR6','dir6@aurora.com','5555-1116'),
(5007,'Aluno DIR7','dir7@aurora.com','5555-1117'),
(5008,'Aluno DIR8','dir8@aurora.com','5555-1118'),
(5009,'Aluno DIR9','dir9@aurora.com','5555-1119'),
(5010,'Aluno DIR10','dir10@aurora.com','5555-1120'),
(6001,'Aluno MK1','mk1@aurora.com','6666-1111'),
(6002,'Aluno MK2','mk2@aurora.com','6666-1112'),
(6003,'Aluno MK3','mk3@aurora.com','6666-1113'),
(6004,'Aluno MK4','mk4@aurora.com','6666-1114'),
(6005,'Aluno MK5','mk5@aurora.com','6666-1115'),
(6006,'Aluno MK6','mk6@aurora.com','6666-1116'),
(6007,'Aluno MK7','mk7@aurora.com','6666-1117');