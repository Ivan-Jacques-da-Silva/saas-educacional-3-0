import React from "react";
import { useParams, useLocation } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CadastroMatricula from "../components/CadastroMatricula.jsx";

const PaginaCadastroMatricula = () => {
  const { id } = useParams(); // Captura o ID da URL se vier por parâmetro
  const location = useLocation();
  
  // Captura o ID da query string se não vier por parâmetro
  const urlParams = new URLSearchParams(location.search);
  const matriculaId = id || urlParams.get('id');
  
  console.log("ID capturado:", matriculaId); // Verifica se o ID está sendo capturado corretamente
  
  return (
    <MasterLayout>
      <Breadcrumb title={matriculaId ? "Editar Matrícula" : "Cadastro de Matrícula"} />
      <CadastroMatricula matriculaId={matriculaId || null} />
    </MasterLayout>
  );
};

export default PaginaCadastroMatricula;
