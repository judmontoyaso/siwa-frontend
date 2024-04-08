import React, { useState } from 'react';
import { Tag } from 'primereact/tag';
import Link from 'next/link';

const ProjectSelector = ({ slug, user }: { slug: string, user: any }) => {
  const [showProjects, setShowProjects] = useState(false);

  return (
    <div className="flex bg-white items-center">
      {slug !== '' && (
        <div className="mr-20 ml-20 flex items-center relative">
          {user && user.Project && ( // Mostrar solo si hay más de un proyecto
            <Tag
              className={`mr-20 ml-20 ${user.Project.length > 1 ? "cursor-pointer" : "" } `} icon="pi pi-cloud"
              onClick={() => user.Project.length > 1 ? setShowProjects(!showProjects) : undefined}
            >
              <span className='font-light'>Project: </span>{slug}
           {user.Project.length > 1 ?  <i className={`pi pi-caret-${showProjects ? 'up' : 'down'} ml-1`} /> : ''}  
            </Tag>
          )}
          {showProjects && (
            <div className="absolute top-10 right-0 mr-20 ml-20 bg-white rounded-lg shadow-md">
              {user?.Project.map((project: string) => (
                project !== slug && (
                  <Link
                    key={project}
                    href={`/projects/${project}`}
                    className="block py-2 px-4 hover:bg-gray-100"
                  >
                    {project}
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
