const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim()) return;

  setErrorMessage('');
  setIsLoading(true);

  try {
    console.log('1. 开始请求');

    const result = await generateClarificationAndQuestions(input);
    console.log('2. 接口返回 result =', result);

    setDecision(input);
    setClarification(result);
    console.log('3. 准备 setStep');

    setStep('questions');
    console.log('4. 已执行 setStep');
  } catch (error: any) {
    console.error('Failed to generate questions:', error);
    setErrorMessage(error?.message || '请求失败');
  } finally {
    setIsLoading(false);
  }
};
