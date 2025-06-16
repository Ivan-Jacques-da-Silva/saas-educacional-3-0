import React from "react";
import { useParams } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CadastroEscolaModal from "../components/CadastroEscola";

const PaginaCadastroEscola = () => {
  const { escolaId } = useParams();
  return (
    <MasterLayout>
      <Breadcrumb title={escolaId ? "Editar Escola" : "Cadastro de Escola"} />
      <CadastroEscolaModal escolaId={escolaId || null} />
    </MasterLayout>
  );
};

export default PaginaCadastroEscola;