import React from "react";
import { useParams } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CadastroEscola from "../components/CadastroEscola.jsx";

const PaginaCadastroEscola = () => {
  const { id } = useParams();

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title={id ? "Editar Escola" : "Cadastro de Escola"} />

        {/* CadastroEscola */}
        <CadastroEscola escolaId={id} />
      </MasterLayout>
    </>
  );
};

export default PaginaCadastroEscola;