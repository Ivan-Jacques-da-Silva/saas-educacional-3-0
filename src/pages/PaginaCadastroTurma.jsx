import React from "react";
import { useParams } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CadastroTurma from "../components/CadastroTurma.jsx";

const PaginaCadastroTurma = () => {
  const { id } = useParams();

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title={id ? "Editar Turma" : "Cadastro de Turma"} />

        {/* CadastroTurma */}
        <CadastroTurma turmaId={id} />
      </MasterLayout>
    </>
  );
};

export default PaginaCadastroTurma;