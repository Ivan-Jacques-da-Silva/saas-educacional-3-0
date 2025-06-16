import React, { useState, useEffect } from "react";
import { API_BASE_URL } from './config';
import axios from "axios";
import { Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const MatriculasLayout = () => {
    const navigate = useNavigate();
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [matriculaToDelete, setMatriculaToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMatriculas, setFilteredMatriculas] = useState([]);

    const fetchMatriculas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/matriculas`);
            const matriculasData = response.data;

            const userType = parseInt(localStorage.getItem('userType'), 10);
            const schoolId = parseInt(localStorage.getItem('schoolId'), 10);

            let filteredData = matriculasData;

            // Filter based on user permissions
            if (userType > 1 && schoolId) {
                filteredData = matriculasData.filter(matricula => 
                    matricula.usuario?.escolaId === schoolId
                );
            }

            setMatriculas(filteredData);
            setFilteredMatriculas(filteredData);
        } catch (error) {
            console.error("Erro ao buscar matrículas:", error);
            toast.error("Erro ao carregar matrículas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatriculas();
    }, []);

    useEffect(() => {
        const filtered = matriculas.filter(matricula =>
            matricula.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            matricula.curso?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            matricula.turma?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMatriculas(filtered);
    }, [searchTerm, matriculas]);

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/matriculas/${matriculaToDelete}`);
            toast.success("Matrícula excluída com sucesso!");
            setShowDeleteModal(false);
            setMatriculaToDelete(null);
            fetchMatriculas();
        } catch (error) {
            console.error("Erro ao excluir matrícula:", error);
            toast.error("Erro ao excluir matrícula.");
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="card h-100 p-0 radius-12">
            <ToastContainer />
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                <h6 className="text-lg fw-semibold mb-0">Lista de Matrículas</h6>
                <Button 
                    variant="primary" 
                    onClick={() => navigate("/cadastro-matricula")}
                >
                    Adicionar Matrícula
                </Button>
            </div>

            <div className="card-body p-24">
                <div className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por aluno, curso ou turma..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="table-responsive scroll-sm">
                    <Table className="table bordered-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">Aluno</th>
                                <th scope="col">Curso</th>
                                <th scope="col">Turma</th>
                                <th scope="col">Data Matrícula</th>
                                <th scope="col">Valor Total</th>
                                <th scope="col">Status</th>
                                <th scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMatriculas.length > 0 ? (
                                filteredMatriculas.map((matricula) => (
                                    <tr key={matricula.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <h6 className="text-md mb-0 fw-medium">
                                                        {matricula.usuario?.nome || 'N/A'}
                                                    </h6>
                                                    <span className="text-sm text-secondary-light fw-medium">
                                                        {matricula.usuario?.email || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-md fw-medium">
                                                {matricula.curso?.nome || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-md fw-medium">
                                                {matricula.turma?.nome || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-md fw-medium">
                                                {formatDate(matricula.dataMatricula)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-md fw-medium">
                                                {formatCurrency(matricula.valorCurso)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                matricula.status === 'Ativa' ? 'text-success-600 bg-success-100' :
                                                matricula.status === 'Inativa' ? 'text-danger-600 bg-danger-100' :
                                                'text-warning-600 bg-warning-100'
                                            } px-20 py-9 radius-4 fw-medium text-sm`}>
                                                {matricula.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-10">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => navigate(`/editar-matricula/${matricula.id}`)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setMatriculaToDelete(matricula.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                >
                                                    Excluir
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        Nenhuma matrícula encontrada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja excluir esta matrícula? Esta ação não pode ser desfeita.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Excluir
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MatriculasLayout;