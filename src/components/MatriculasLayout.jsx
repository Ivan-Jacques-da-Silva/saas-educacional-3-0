import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL_NEW } from './config';

const MatriculasLayout = () => {
    const [matriculas, setMatriculas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [escolas, setEscolas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Verificar tipo de usuário e escola do localStorage
    const userType = parseInt(localStorage.getItem('tipoUser')) || 0;
    const userSchoolId = parseInt(localStorage.getItem('escolaId')) || 0;

    useEffect(() => {
        fetchMatriculas();
        fetchUsuarios();
        fetchEscolas();
    }, []);

    const fetchMatriculas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL_NEW}/matriculas`);
            let matriculasData = response.data;

            // Filtrar por escola se usuário for diretor ou abaixo (tipo 2 a 5)
            if (userType >= 2 && userSchoolId) {
                matriculasData = matriculasData.filter(matricula => 
                    matricula.escolaId === userSchoolId
                );
            }

            setMatriculas(matriculasData);
        } catch (error) {
            console.error('Erro ao buscar matrículas:', error);
            setError('Erro ao carregar matrículas');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL_NEW}/usuarios-matricula`);
            let usuariosData = response.data;

            // Filtrar por escola se usuário for diretor ou abaixo (tipo 2 a 5)
            if (userType >= 2 && userSchoolId) {
                usuariosData = usuariosData.filter(usuario => 
                    usuario.escolaId === userSchoolId
                );
            }

            setUsuarios(usuariosData);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    const fetchEscolas = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL_NEW}/escolas`);
            let escolasData = response.data;

            // Filtrar por escola se usuário for diretor ou abaixo (tipo 2 a 5)
            if (userType >= 2 && userSchoolId) {
                escolasData = escolasData.filter(escola => 
                    escola.id === userSchoolId
                );
            }

            setEscolas(escolasData);
        } catch (error) {
            console.error('Erro ao buscar escolas:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta matrícula?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL_NEW}/matriculas/${id}`);
            fetchMatriculas();
            alert('Matrícula excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir matrícula:', error);
            alert('Erro ao excluir matrícula');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getTipoUserName = (tipo) => {
        const tipos = {
            1: 'Gestor',
            2: 'Diretor',
            3: 'Secretário',
            4: 'Professor',
            5: 'Aluno'
        };
        return tipos[tipo] || 'Indefinido';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <span className="text-md fw-medium text-secondary-light mb-0">Mostrando</span>
                    <select className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px">
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                    </select>
                    <span className="text-md fw-medium text-secondary-light mb-0">de {matriculas.length} matrículas</span>
                </div>
                <Link to="/cadastro-matricula" className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2">
                    <i className="ri-add-line"></i>
                    Nova Matrícula
                </Link>
            </div>

            <div className="card-body p-24">
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="table-responsive scroll-sm">
                    <table className="table bordered-table sm-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">
                                    <div className="d-flex align-items-center gap-10">
                                        <div className="form-check style-check d-flex align-items-center">
                                            <input className="form-check-input radius-4 border border-neutral-400" type="checkbox" />
                                        </div>
                                        S.L
                                    </div>
                                </th>
                                <th scope="col">Aluno</th>
                                <th scope="col">Escola</th>
                                <th scope="col">Valor Curso</th>
                                <th scope="col">Tipo Cobrança</th>
                                <th scope="col">Status</th>
                                <th scope="col">Data Cadastro</th>
                                <th scope="col" className="text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matriculas.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        Nenhuma matrícula encontrada
                                    </td>
                                </tr>
                            ) : (
                                matriculas.map((matricula, index) => (
                                    <tr key={matricula.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-10">
                                                <div className="form-check style-check d-flex align-items-center">
                                                    <input className="form-check-input radius-4 border border-neutral-400" type="checkbox" />
                                                </div>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                                                        {matricula.usuario?.nome || 'N/A'}
                                                    </h6>
                                                    <span className="text-sm text-secondary-light fw-medium">
                                                        {matricula.usuario?.email || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-md mb-0 fw-medium text-secondary-light">
                                                {matricula.escola?.nome || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-md mb-0 fw-medium text-secondary-light">
                                                {formatCurrency(matricula.valorCurso)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`py-4 px-16 radius-4 text-sm fw-medium ${
                                                matricula.tipoCobranca === 'parcelado' 
                                                    ? 'text-info-600 bg-info-100' 
                                                    : 'text-success-600 bg-success-100'
                                            }`}>
                                                {matricula.tipoCobranca === 'parcelado' ? 'Parcelado' : 'À Vista'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`py-4 px-16 radius-4 text-sm fw-medium ${
                                                matricula.status === 'ativo' 
                                                    ? 'text-success-600 bg-success-100' 
                                                    : 'text-danger-600 bg-danger-100'
                                            }`}>
                                                {matricula.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-md mb-0 fw-medium text-secondary-light">
                                                {formatDate(matricula.createdAt)}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex align-items-center gap-10 justify-content-center">
                                                <Link 
                                                    to={`/cadastro-matricula/${matricula.id}`}
                                                    className="bg-success-100 text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                >
                                                    <i className="ri-edit-line"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(matricula.id)}
                                                    className="bg-danger-100 text-danger-600 bg-hover-danger-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
                    <span>Mostrando 1 a {matriculas.length} de {matriculas.length} registros</span>
                    <nav aria-label="Page navigation example">
                        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                            <li className="page-item">
                                <a className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md" href="#">
                                    <i className="ri-arrow-left-s-line"></i>
                                </a>
                            </li>
                            <li className="page-item">
                                <a className="page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md bg-primary-600 text-white" href="#">1</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px" href="#">
                                    <i className="ri-arrow-right-s-line"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default MatriculasLayout;