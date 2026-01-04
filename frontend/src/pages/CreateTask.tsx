import Navbar from "@components/layout/Navbar";
import Sidebar from "@components/layout/Sidebar";
import Footer from "@components/layout/Footer";
import TaskForm from "@components/tasks/TaskForm";

const CreateTask = () => {
  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main-container">
        <Sidebar />

        <main className="main-content-area">
          <div className="content-header">
            <div className="header-title-section">
              <h1 className="dashboard-title">Créer une tâche</h1>
              <p>Remplissez le formulaire pour créer une nouvelle tâche.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <TaskForm />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CreateTask;
