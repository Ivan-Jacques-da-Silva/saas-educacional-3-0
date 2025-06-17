import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:3001/api";

const CursosLayout = () => {
    const [cursos, setCursos] = useState([]);
    const [filteredCursos, setFilteredCursos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [cursosPerPage, setCursosPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [cursoToDelete, setCursoToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCursos();
    }, []);

    useEffect(() => {
        const filtered = cursos.filter((curso) =>
            curso.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCursos(filtered);
        setCurrentPage(1);
    }, [searchTerm, cursos]);

    const shouldFilterBySchool = () => {
        const userType = localStorage.getItem('tipoUser');
        return userType && parseInt(userType) >= 2; // Diretor para baixo
    };

    const getUserSchoolId = () => {
        return localStorage.getItem('escolaId');
    };

    const fetchCursos = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/cursos`);
            const data = await response.json();

            if (shouldFilterBySchool()) {
                const userSchoolId = getUserSchoolId();
                const filtered = data.filter(curso => 
                    curso.instrutor?.escolaId === parseInt(userSchoolId)
                );
                setCursos(filtered);
            } else {
                setCursos(data);
            }
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!cursoToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cursos/${cursoToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir curso');
            }

            await fetchCursos();
            setShowDeleteModal(false);
            setCursoToDelete(null);
        } catch (error) {
            console.error('Erro ao excluir curso:', error);
            alert('Erro ao excluir curso. Verifique se não há matrículas vinculadas.');
        }
    };

    const openDeleteModal = (curso) => {
        setCursoToDelete(curso);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setCursoToDelete(null);
    };

    // Paginação
    const totalPaginas = Math.ceil(filteredCursos.length / cursosPerPage);
    const currentCursos = filteredCursos.slice(
        (currentPage - 1) * cursosPerPage,
        currentPage * cursosPerPage
    );

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="card h-100 p-0 radius-12">
            {/* Header */}
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <span className="text-md fw-medium text-secondary-light mb-0">Mostrar</span>
                    <select 
                        className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px"
                        value={cursosPerPage}
                        onChange={(e) => setCursosPerPage(Number(e.target.value))}
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
                            placeholder="Buscar curso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Icon icon="ion:search-outline" className="icon" />
                    </form>
                </div>
                <Link
                    to="/cadastro-curso"
                    className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                >
                    <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
                    Novo Curso
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
                                    <th scope="col">Nome do Curso</th>
                                    <th scope="col">Data de Cadastro</th>
                                    <th scope="col">Descrição</th>
                                    <th scope="col" className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCursos.length > 0 ? (
                                    currentCursos.map((curso, index) => (
                                        <tr key={curso.id}>
                                            <td>{(currentPage - 1) * cursosPerPage + index + 1}</td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                {curso.titulo}
                                                </span>
                                            </td>
                                            <td>{formatDate(curso.dataCadastro)}</td>
                                            <td>
                                                <span className="text-sm text-secondary-light">
                                                {curso.descricao}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center gap-10 justify-content-center">
                                                    <Link
                                                        to={`/editar-curso/${curso.id}`}
                                                        className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                        title="Editar"
                                                    >
                                                        <Icon icon="lucide:edit" className="menu-icon" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                        onClick={() => openDeleteModal(curso)}
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
                                        <td colSpan="5" className="text-center py-4">
                                            Nenhum curso encontrado
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
                            Mostrando {currentCursos.length} de {filteredCursos.length} registros
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
                                <p>Tem certeza que deseja excluir o curso <strong>{cursoToDelete?.nome}</strong>?</p>
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

export default CursosLayout;