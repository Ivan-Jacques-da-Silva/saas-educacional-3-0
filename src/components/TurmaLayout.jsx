import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const TurmaLayout = () => {
    const [turmas, setTurmas] = useState([]);
    const [filteredTurmas, setFilteredTurmas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [turmasPerPage, setTurmasPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [turmaToDelete, setTurmaToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTurmas();
    }, []);

    useEffect(() => {
        const filtered = turmas.filter((turma) =>
            turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            turma.curso?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            turma.escola?.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTurmas(filtered);
        setCurrentPage(1);
    }, [searchTerm, turmas]);

    const shouldFilterBySchool = () => {
        const userType = localStorage.getItem('tipoUser');
        return userType && parseInt(userType) >= 2; // Diretor para baixo
    };

    const getUserSchoolId = () => {
        return localStorage.getItem('escolaId');
    };

    const fetchTurmas = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/turmas`);
            const data = await response.json();

            // Filtrar por escola se necessário
            let filteredData = data;
            if (shouldFilterBySchool()) {
                const schoolId = getUserSchoolId();
                if (schoolId) {
                    filteredData = data.filter(turma => turma.escolaId === parseInt(schoolId));
                }
            }

            setTurmas(filteredData);
            setFilteredTurmas(filteredData);
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!turmaToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/turmas/${turmaToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir turma');
            }

            await fetchTurmas();
            setShowDeleteModal(false);
            setTurmaToDelete(null);
        } catch (error) {
            console.error('Erro ao excluir turma:', error);
            alert('Erro ao excluir turma. Verifique se não há matrículas vinculadas.');
        }
    };

    const openDeleteModal = (turma) => {
        setTurmaToDelete(turma);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setTurmaToDelete(null);
    };

    // Paginação
    const totalPaginas = Math.ceil(filteredTurmas.length / turmasPerPage);
    const currentTurmas = filteredTurmas.slice(
        (currentPage - 1) * turmasPerPage,
        currentPage * turmasPerPage
    );

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        return timeString.substring(0, 5);
    };

    return (
        <div className="card h-100 p-0 radius-12">
            {/* Header */}
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <span className="text-md fw-medium text-secondary-light mb-0">Mostrar</span>
                    <select 
                        className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px"
                        value={turmasPerPage}
                        onChange={(e) => setTurmasPerPage(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                    <form className="navbar-search">
                        <input
                            type="text"
                            className="bg-base h-40-px w-auto"
                            name="search"
                            placeholder="Buscar turma..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Icon icon="ion:search-outline" className="icon" />
                    </form>
                </div>
                <Link
                    to="/cadastro-turma"
                    className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                >
                    <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
                    Nova Turma
                </Link>
            </div>

            {/* Table */}
            <div className="card-body p-24">
                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : (
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table sm-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Nome da Turma</th>
                                    <th scope="col">Curso</th>
                                    <th scope="col">Escola</th>
                                    <th scope="col">Professor</th>
                                    <th scope="col">Horário</th>
                                    <th scope="col">Data Início</th>
                                    <th scope="col" className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTurmas.length > 0 ? (
                                    currentTurmas.map((turma, index) => (
                                        <tr key={turma.id}>
                                            <td>{(currentPage - 1) * turmasPerPage + index + 1}</td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {turma.nome}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-secondary-light">
                                                    {turma.curso?.nome || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-secondary-light">
                                                    {turma.escola?.nome || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-secondary-light">
                                                    {turma.professor?.nome || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-secondary-light">
                                                    {formatTime(turma.horarioInicio)} - {formatTime(turma.horarioFim)}
                                                </span>
                                            </td>
                                            <td>{formatDate(turma.dataInicio)}</td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center gap-10 justify-content-center">
                                                    <Link
                                                        to={`/editar-turma/${turma.id}`}
                                                        className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                        title="Editar"
                                                    >
                                                        <Icon icon="lucide:edit" className="menu-icon" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                        onClick={() => openDeleteModal(turma)}
                                                        title="Excluir"
                                                    >
                                                        <Icon icon="fluent:delete-24-regular" className="menu-icon" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            Nenhuma turma encontrada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginação */}
                {totalPaginas > 1 && (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
                        <span>
                            Mostrando {currentTurmas.length} de {filteredTurmas.length} registros
                        </span>
                        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                            <li className="page-item">
                                <button
                                    className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <Icon icon="ep:d-arrow-left" />
                                </button>
                            </li>
                            {Array.from({ length: Math.min(5, totalPaginas) }, (_, idx) => {
                                let pageNumber;
                                if (totalPaginas <= 5) {
                                    pageNumber = idx + 1;
                                } else if (currentPage <= 3) {
                                    pageNumber = idx + 1;
                                } else if (currentPage >= totalPaginas - 2) {
                                    pageNumber = totalPaginas - 4 + idx;
                                } else {
                                    pageNumber = currentPage - 2 + idx;
                                }

                                return (
                                    <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? "active" : ""}`}>
                                        <button
                                            className={`page-link text-md fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px ${
                                                currentPage === pageNumber 
                                                    ? "bg-primary-600 text-white" 
                                                    : "bg-neutral-200 text-secondary-light"
                                            }`}
                                            onClick={() => setCurrentPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </button>
                                    </li>
                                );
                            })}
                            <li className="page-item">
                                <button
                                    className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPaginas))}
                                    disabled={currentPage === totalPaginas}
                                >
                                    <Icon icon="ep:d-arrow-right" />
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar Exclusão</h5>
                                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
                            </div>
                            <div className="modal-body">
                                <p>Tem certeza que deseja excluir a turma <strong>{turmaToDelete?.nome}</strong>?</p>
                                <p className="text-danger text-sm">Esta ação não pode ser desfeita.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                                    Cancelar
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TurmaLayout;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL_NEW } from "../config/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TurmaLayout = () => {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTurmas();
  }, []);

  const fetchTurmas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL_NEW}/turmas`);
      setTurmas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      toast.error("Erro ao carregar turmas");
      setLoading(false);
    }
  };

  const handleEdit = (turmaId) => {
    navigate(`/cadastro-turma/${turmaId}`);
  };

  const handleDelete = async (turmaId) => {
    if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
      try {
        await axios.delete(`${API_BASE_URL_NEW}/turmas/${turmaId}`);
        toast.success("Turma excluída com sucesso");
        fetchTurmas();
      } catch (error) {
        console.error("Erro ao excluir turma:", error);
        toast.error("Erro ao excluir turma");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="card h-100 p-0 radius-12">
      <ToastContainer />
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
        <h6 className="text-lg fw-semibold mb-0">Lista de Turmas</h6>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate("/cadastro-turma")}
        >
          Nova Turma
        </button>
      </div>
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Data</th>
                <th scope="col">Professor</th>
                <th scope="col">Escola</th>
                <th scope="col">Curso</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma) => (
                <tr key={turma.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="text-md mb-0 fw-normal text-secondary-light">
                        {turma.nome}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-md mb-0 fw-normal text-secondary-light">
                      {formatDate(turma.data)}
                    </span>
                  </td>
                  <td>
                    <span className="text-md mb-0 fw-normal text-secondary-light">
                      {turma.professor?.nome || "Não informado"}
                    </span>
                  </td>
                  <td>
                    <span className="text-md mb-0 fw-normal text-secondary-light">
                      {turma.escola?.nome || "Não informado"}
                    </span>
                  </td>
                  <td>
                    <span className="text-md mb-0 fw-normal text-secondary-light">
                      {turma.curso?.titulo || "Não informado"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${turma.status === 'ativo' ? 'text-success-600 bg-success-100' : 'text-danger-600 bg-danger-100'}`}>
                      {turma.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-center gap-10">
                      <button
                        type="button"
                        className="text-xl text-success-600"
                        onClick={() => handleEdit(turma.id)}
                      >
                        <i className="ri-edit-line" />
                      </button>
                      <button
                        type="button"
                        className="text-xl text-danger-600 remove-btn"
                        onClick={() => handleDelete(turma.id)}
                      >
                        <i className="ri-delete-bin-6-line" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TurmaLayout;
