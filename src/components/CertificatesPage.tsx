import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Award, Plus, List } from "lucide-react";
import CertificateList from "./CertificateList";
import SimpleCertificateModal from "./SimpleCertificateModal";
import type { UserProfile, Subsidiary } from "../App";

interface CertificatesPageProps {
  user: UserProfile;
  currentSubsidiary: Subsidiary | null;
}

export default function CertificatesPage({
  user,
  currentSubsidiary,
}: CertificatesPageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    // Refresh the list after creating a new certificate
    setActiveTab("list");
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="w-8 h-8 text-primary" />
          Certificate Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Create, view, and manage your certificates
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            My Certificates
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <CertificateList
            onCreateNew={handleCreateNew}
            subsidiaryId={""} // Empty string for now - this page might not be used in current app
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Create a New Certificate
                </h3>
                <p className="text-muted-foreground mb-6">
                  Generate a certificate with your custom details and design
                </p>
                <SimpleCertificateModal
                  isOpen={false}
                  onClose={() => {}}
                  user={user}
                  currentSubsidiary={currentSubsidiary}
                />
                <div className="mt-4">
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Start Creating
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Certificate Modal */}
      <SimpleCertificateModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        user={user}
        currentSubsidiary={currentSubsidiary}
      />
    </div>
  );
}
