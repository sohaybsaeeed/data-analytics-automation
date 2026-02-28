import { Card } from "@/components/ui/card";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { Cloud, Server, Database, Workflow, Warehouse, HardDrive, Search, Cpu, Zap, Shield, Globe, Layers } from "lucide-react";

const awsServices = [
  { icon: Workflow, name: "AWS Glue & EMR", description: "Build and orchestrate ETL pipelines with Glue jobs and Spark on EMR clusters" },
  { icon: Warehouse, name: "Amazon Redshift", description: "Build and manage data warehouses with petabyte-scale analytics" },
  { icon: HardDrive, name: "Amazon S3 Data Lakes", description: "Design and manage data lakes with S3, governed by Lake Formation" },
  { icon: Database, name: "DynamoDB & DocumentDB", description: "Manage NoSQL databases for high-performance workloads" },
  { icon: Search, name: "Amazon Athena", description: "Query data lakes using standard SQL without infrastructure management" },
  { icon: Zap, name: "Lambda & EventBridge", description: "Build event-driven architectures with serverless compute" },
  { icon: Server, name: "EC2 & Step Functions", description: "Manage compute instances and orchestrate complex workflows" },
  { icon: Shield, name: "Lake Formation", description: "Centralized governance, security, and access control for data lakes" },
];

const multiCloudServices = [
  { icon: Layers, name: "Apache Spark & PySpark", description: "Distributed data processing with Spark on any cloud platform" },
  { icon: Workflow, name: "Apache Airflow & Kafka", description: "Orchestrate workflows and stream real-time data pipelines" },
  { icon: Globe, name: "Azure & GCP Big Data", description: "Azure Data Factory, Databricks, BigQuery, and Dataflow integrations" },
  { icon: Cpu, name: "Hadoop & HDFS", description: "MapReduce, YARN, Hive — full Hadoop ecosystem support" },
];

const CloudServices = () => {
  return (
    <section id="cloud-services" className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">
            Cloud Data Engineering
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Architect scalable data pipelines and event-driven infrastructures across AWS, Azure, and GCP
          </p>
        </ScrollReveal>

        {/* AWS Services */}
        <div className="mb-16">
          <ScrollReveal delay={0.1}>
            <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-8 flex items-center gap-3">
              <Cloud className="w-5 h-5 text-primary" />
              Amazon Web Services
            </h3>
          </ScrollReveal>
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
            {awsServices.map((service) => (
              <StaggerItem key={service.name}>
                <Card className="group p-6 bg-card border-border hover:border-secondary/30 transition-all duration-500 h-full">
                  <div className="flex flex-col space-y-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-colors">
                      <service.icon className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-1.5">{service.name}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Multi-Cloud & Big Data */}
        <div>
          <ScrollReveal delay={0.1}>
            <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-8 flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              Multi-Cloud & Big Data
            </h3>
          </ScrollReveal>
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
            {multiCloudServices.map((service) => (
              <StaggerItem key={service.name}>
                <Card className="group p-6 bg-card border-border hover:border-secondary/30 transition-all duration-500 h-full">
                  <div className="flex flex-col space-y-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary/5 border border-primary/10 group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-colors">
                      <service.icon className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-1.5">{service.name}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};

export default CloudServices;
