import React from 'react';
import { Layout, Spin, Alert } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BugTable from './components/BugTable';
import { useBugs } from './hooks/useBugs';
import './App.css';

const { Header, Content, Footer } = Layout;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Main App wrapped with providers
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ color: 'white', margin: 0 }}>Bug Tracker</h1>
        </Header>
        <Content style={{ padding: '24px' }}>
          <BugContent />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Bug Tracker ©{new Date().getFullYear()} Created with Ant Design
        </Footer>
      </Layout>
    </QueryClientProvider>
  );
};

// Content component with data fetching logic
const BugContent: React.FC = () => {
  const { data, isLoading, error } = useBugs();

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to load bug reports. Please try again later."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="site-layout-content">
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Loading bug reports...</p>
        </div>
      ) : (
        <BugTable bugs={data || []} isLoading={isLoading} />
      )}
    </div>
  );
};

export default App;