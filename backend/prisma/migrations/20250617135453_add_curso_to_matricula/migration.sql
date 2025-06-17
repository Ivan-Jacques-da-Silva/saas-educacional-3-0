-- CreateTable
CREATE TABLE "users" (
    "cp_id" SERIAL NOT NULL,
    "cp_nome" TEXT NOT NULL,
    "cp_email" TEXT NOT NULL,
    "cp_login" TEXT NOT NULL,
    "cp_password" TEXT NOT NULL,
    "cp_tipo_user" INTEGER NOT NULL,
    "cp_rg" TEXT,
    "cp_cpf" TEXT NOT NULL,
    "cp_datanascimento" TEXT NOT NULL,
    "cp_estadocivil" TEXT,
    "cp_cnpj" TEXT,
    "cp_ie" TEXT,
    "cp_whatsapp" TEXT,
    "cp_telefone" TEXT,
    "cp_empresaatuacao" TEXT,
    "cp_profissao" TEXT,
    "cp_end_cidade_estado" TEXT,
    "cp_end_rua" TEXT,
    "cp_end_num" TEXT,
    "cp_end_cep" TEXT,
    "cp_descricao" TEXT,
    "cp_foto_perfil" TEXT,
    "cp_escola_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("cp_id")
);

-- CreateTable
CREATE TABLE "escolas" (
    "cp_ec_id" SERIAL NOT NULL,
    "cp_ec_nome" TEXT NOT NULL,
    "cp_ec_data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cp_ec_responsavel_id" INTEGER,
    "cp_ec_cidade" TEXT,
    "cp_ec_bairro" TEXT,
    "cp_ec_estado" TEXT,
    "cp_ec_rua" TEXT,
    "cp_ec_numero" TEXT,
    "cp_ec_descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escolas_pkey" PRIMARY KEY ("cp_ec_id")
);

-- CreateTable
CREATE TABLE "matriculas" (
    "cp_mt_id" SERIAL NOT NULL,
    "cp_mt_usuario_id" INTEGER NOT NULL,
    "cp_mt_escola_id" INTEGER,
    "cp_mt_curso_id" INTEGER,
    "cp_mt_valor_curso" DOUBLE PRECISION NOT NULL,
    "cp_mt_numero_parcelas" INTEGER,
    "cp_mt_valor_parcela" DOUBLE PRECISION,
    "cp_mt_valor_mensalidade" DOUBLE PRECISION,
    "cp_mt_tipo_cobranca" TEXT NOT NULL DEFAULT 'parcelado',
    "cp_mt_primeira_data_pagamento" TIMESTAMP(3),
    "cp_mt_status" TEXT NOT NULL DEFAULT 'ativo',
    "cp_mt_nivel_idioma" TEXT,
    "cp_mt_horario_inicio" TEXT,
    "cp_mt_horario_fim" TEXT,
    "cp_mt_escolaridade" TEXT,
    "cp_mt_local_nascimento" TEXT,
    "cp_mt_rede_social" TEXT,
    "cp_mt_nome_pai" TEXT,
    "cp_mt_contato_pai" TEXT,
    "cp_mt_nome_mae" TEXT,
    "cp_mt_contato_mae" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("cp_mt_id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "cp_cr_id" SERIAL NOT NULL,
    "cp_cr_titulo" TEXT NOT NULL,
    "cp_cr_descricao" TEXT,
    "cp_cr_instrutor_id" INTEGER,
    "cp_cr_categoria" TEXT,
    "cp_cr_nivel" TEXT,
    "cp_cr_duracao" TEXT,
    "cp_cr_preco" DOUBLE PRECISION,
    "cp_cr_status" TEXT NOT NULL DEFAULT 'ativo',
    "cp_cr_data_publicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cp_cr_tags" TEXT,
    "cp_cr_arquivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("cp_cr_id")
);

-- CreateTable
CREATE TABLE "turmas" (
    "cp_tr_id" SERIAL NOT NULL,
    "cp_tr_nome" TEXT NOT NULL,
    "cp_tr_professor_id" INTEGER,
    "cp_tr_escola_id" INTEGER,
    "cp_tr_dias_semana" TEXT,
    "cp_tr_status" TEXT NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cp_tr_curso_id" INTEGER,
    "cp_tr_data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("cp_tr_id")
);

-- CreateTable
CREATE TABLE "audios" (
    "cp_au_id" SERIAL NOT NULL,
    "cp_au_titulo" TEXT NOT NULL,
    "cp_au_descricao" TEXT,
    "cp_au_usuario_id" INTEGER,
    "cp_au_categoria" TEXT,
    "cp_au_duracao" TEXT,
    "cp_au_status" TEXT NOT NULL DEFAULT 'ativo',
    "cp_au_arquivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audios_pkey" PRIMARY KEY ("cp_au_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cp_email_key" ON "users"("cp_email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cp_login_key" ON "users"("cp_login");

-- CreateIndex
CREATE UNIQUE INDEX "escolas_cp_ec_nome_key" ON "escolas"("cp_ec_nome");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cp_escola_id_fkey" FOREIGN KEY ("cp_escola_id") REFERENCES "escolas"("cp_ec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escolas" ADD CONSTRAINT "escolas_cp_ec_responsavel_id_fkey" FOREIGN KEY ("cp_ec_responsavel_id") REFERENCES "users"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_cp_mt_escola_id_fkey" FOREIGN KEY ("cp_mt_escola_id") REFERENCES "escolas"("cp_ec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_cp_mt_usuario_id_fkey" FOREIGN KEY ("cp_mt_usuario_id") REFERENCES "users"("cp_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_cp_mt_curso_id_fkey" FOREIGN KEY ("cp_mt_curso_id") REFERENCES "cursos"("cp_cr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_cp_cr_instrutor_id_fkey" FOREIGN KEY ("cp_cr_instrutor_id") REFERENCES "users"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_cp_tr_curso_id_fkey" FOREIGN KEY ("cp_tr_curso_id") REFERENCES "cursos"("cp_cr_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_cp_tr_escola_id_fkey" FOREIGN KEY ("cp_tr_escola_id") REFERENCES "escolas"("cp_ec_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_cp_tr_professor_id_fkey" FOREIGN KEY ("cp_tr_professor_id") REFERENCES "users"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audios" ADD CONSTRAINT "audios_cp_au_usuario_id_fkey" FOREIGN KEY ("cp_au_usuario_id") REFERENCES "users"("cp_id") ON DELETE SET NULL ON UPDATE CASCADE;
