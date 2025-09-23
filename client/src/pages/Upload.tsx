import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { uploadAPI } from '../services/api';
// import { useAuth } from '../hooks/useAuth';
import { Button, Card, Container, ErrorMessage, SuccessMessage, Spinner } from '../styles/GlobalStyles';

const UploadContainer = styled.div`
  padding: 60px 0;
  min-height: 80vh;
  background: transparent;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  color: white;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PageSubtitle = styled.p`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const UploadCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
`;

const Dropzone = styled.div<{ isDragActive: boolean; hasFile: boolean }>`
  border: 2px dashed ${props => 
    props.isDragActive ? '#667eea' : 
    props.hasFile ? '#48bb78' : 'rgba(102, 126, 234, 0.3)'
  };
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  background: ${props => 
    props.isDragActive ? 'rgba(102, 126, 234, 0.1)' : 
    props.hasFile ? 'rgba(72, 187, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)'
  };
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }
`;

const DropzoneIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const DropzoneText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
`;

const DropzoneSubtext = styled.div`
  font-size: 14px;
  color: #4a5568;
`;

const FileInfo = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
`;

const FileName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
  font-size: 16px;
`;

const FileSize = styled.div`
  font-size: 14px;
  color: #4a5568;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  color: #2d3748;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
`;

const UploadButton = styled(Button)`
  min-width: 200px;
`;

const RemoveButton = styled(Button)`
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  border: 2px solid rgba(255, 255, 255, 0.3);
  min-width: 120px;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 1);
    color: #2d3748;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 10px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 0;
  backdrop-filter: blur(10px);

  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
    border-radius: 8px;
  }
`;

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemoveFile = () => {
    setFile(null);
    setSubjectName('');
    setMessage(null);
    setUploadId(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: '파일을 선택해주세요.' });
      return;
    }

    if (!subjectName.trim()) {
      setMessage({ type: 'error', text: '과목명을 입력해주세요.' });
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage(null);

    try {
      // 파일 업로드
      setProgress(30);
      const uploadResponse = await uploadAPI.uploadFile(file, subjectName);
      const uploadId = uploadResponse.data.upload.id;
      setUploadId(uploadId);

      setProgress(60);
      setMessage({ type: 'success', text: '파일이 성공적으로 업로드되었습니다. 심사를 시작합니다...' });

      // 유사도 검사 실행
      setReviewing(true);
      setProgress(80);
      const similarityResponse = await uploadAPI.runSimilarityCheck(uploadId);

      setProgress(100);
      const result = similarityResponse.data.result;
      // 내용 유사도 추출 (API 응답의 details.hybrid.top[0].score_chunk에서)
      const contentSimilarity = result.details?.hybrid?.top?.[0]?.score_chunk 
        ? Math.round(result.details.hybrid.top[0].score_chunk * 100)
        : 0;
      
      console.log('API 응답 구조:', result);
      console.log('내용 유사도:', contentSimilarity);
      
      setMessage({ 
        type: 'success', 
        text: `유사도 검사가 완료되었습니다! 내용 유사도: ${contentSimilarity}% (${result.isSimilar ? '유사과목 인정' : '유사과목 미인정'})` 
      });

      // 심사 완료 후 심사 결과 페이지로 이동
      setTimeout(() => {
        window.location.href = '/reviews';
      }, 2000);

    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || '업로드 중 오류가 발생했습니다.' 
      });
    } finally {
      setUploading(false);
      setReviewing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <UploadContainer>
      <Container>
        <PageTitle>파일 업로드</PageTitle>
        <PageSubtitle>
          보건교육사 유사과목 심사를 위한 문서를 업로드하세요
        </PageSubtitle>

        <UploadCard>
          <Dropzone {...getRootProps()} isDragActive={isDragActive} hasFile={!!file}>
            <input {...getInputProps()} />
            <DropzoneIcon>
              {file ? '✅' : isDragActive ? '📁' : '📄'}
            </DropzoneIcon>
            <DropzoneText>
              {file 
                ? '파일이 선택되었습니다' 
                : isDragActive 
                  ? '파일을 여기에 놓으세요' 
                  : '파일을 드래그하거나 클릭하여 선택하세요'
              }
            </DropzoneText>
            <DropzoneSubtext>
              PDF, Word, Excel, 텍스트 파일 (최대 10MB)
            </DropzoneSubtext>
          </Dropzone>

          {file && (
            <FileInfo>
              <FileName>{file.name}</FileName>
              <FileSize>{formatFileSize(file.size)}</FileSize>
            </FileInfo>
          )}

          <FormGroup>
            <Label htmlFor="subjectName">과목명 *</Label>
            <Input
              type="text"
              id="subjectName"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="심사할 과목명을 입력하세요"
              disabled={uploading || reviewing}
            />
          </FormGroup>

          {message && (
            <>
              {message.type === 'success' ? (
                <SuccessMessage>{message.text}</SuccessMessage>
              ) : (
                <ErrorMessage>{message.text}</ErrorMessage>
              )}
            </>
          )}

          {(uploading || reviewing) && (
            <ProgressBar progress={progress} />
          )}

          <ButtonGroup>
            {file && (
              <RemoveButton 
                onClick={handleRemoveFile}
                disabled={uploading || reviewing}
              >
                파일 제거
              </RemoveButton>
            )}
            <UploadButton 
              onClick={handleUpload}
              disabled={!file || !subjectName.trim() || uploading || reviewing}
            >
              {uploading ? (
                <>
                  <Spinner /> 업로드 중...
                </>
              ) : reviewing ? (
                <>
                  <Spinner /> 심사 중...
                </>
              ) : (
                '업로드 및 심사 시작'
              )}
            </UploadButton>
          </ButtonGroup>
        </UploadCard>
      </Container>
    </UploadContainer>
  );
};

export default Upload;