import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import EscolasLayout from "../components/EscolasLayout";

const EscolaPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Escolas" />
            <EscolasLayout />
        </MasterLayout>
    );
};

export default EscolaPage;