import { BadgeCheckIcon, ClockIcon, ExclamationIcon } from '@heroicons/react/solid';

export default function CredentialCard({ credential }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center text-green-600">
            <BadgeCheckIcon className="h-5 w-5 mr-1" />
            <span>Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <ClockIcon className="h-5 w-5 mr-1" />
            <span>Pending</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <ExclamationIcon className="h-5 w-5 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <span>Unknown</span>
          </div>
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'education':
        return 'Education';
      case 'work':
        return 'Work Experience';
      case 'certificate':
        return 'Certificate';
      case 'skill':
        return 'Skill';
      default:
        return 'Credential';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500 uppercase">
              {getTypeLabel(credential.type)}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-1">{credential.title}</h3>
            <p className="text-gray-600 mt-1">{credential.issuer}</p>
          </div>
          <div>
            {getStatusIcon(credential.verificationStatus)}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-sm">
        <div className="flex justify-between">
          <div className="text-gray-500">
            <span>Issued: </span>
            <span className="text-gray-800">{formatDate(credential.dateIssued)}</span>
          </div>
          {credential.documentUrl && (
            <a 
              href={credential.documentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
            >
              View Document
            </a>
          )}
        </div>
      </div>
    </div>
  );
}