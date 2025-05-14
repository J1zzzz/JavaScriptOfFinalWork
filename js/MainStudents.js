// 页面加载时获取学生数据
document.addEventListener('DOMContentLoaded', function() {
  fetchStudents(1);
  document.removeEventListener('DOMContentLoaded', arguments.callee);
});

// 获取学生数据
async function fetchStudents(page = 1) {
  try {

    const response = await fetch(`http://localhost:8080/api/Db-SearchAll?page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // 检查返回的数据结构
    if (data.stuInfo) {
      updateTable(data.stuInfo);
      updatePagination(data.currentPage, data.totalPages);
    } else {
      alert('获取数据失败：返回的数据格式不正确');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('获取数据失败，请稍后重试');
  }
}


async function fetchStudentsByClass(page = 1,classId) {
  try {
    const response = await fetch(`http://localhost:8080/api/Db-SearchStuByClass?page=${page}&classId=${classId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // 检查返回的数据结构
    if (data.stuInfo) {
      updateTable(data.stuInfo);
      updateClassPagination(classId,data.currentPage, data.totalPages);
    } else {
      alert('获取数据失败：返回的数据格式不正确');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('获取数据失败，请稍后重试');
  }
}
// 更新表格内容
function updateTable(students) {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';

  if (students && students.length > 0) {
    students.forEach(student => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
                <td>${student.stu_no}</td>
                <td>${student.stu_name}</td>
                <td>${student.stu_Class.class_name}</td>
                <td>${student.stu_Class.subject}</td>
                <td>${student.stu_Class.class_department}</td>
                <td>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="button" class="delete-button" onclick="deleteStudent('${student.stu_no}')">删除学生</button>
                        <button type="button" class="modify-button" onclick="openModifyModal('${student.stu_no}', '${student.stu_name}', '${student.class_id}')">修改信息</button>
                    </div>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = '<tr><td colspan="6">没有学生信息</td></tr>';
  }
}
function closePagination() {
  const pagination = document.querySelector('.pagination');
  if (pagination) {
    pagination.style.display = 'none'; // 隐藏分页链接
    document.getElementById('returnBtn').style.display='flex';  }
}
function openPagination() {
  const pagination = document.querySelector('.pagination');
  if (pagination) {
    pagination.style.display = 'flex'; // 显示分页链接
    document.getElementById('returnBtn').style.display='none';
  }
}
function updateClassPagination(classId,currentPage, totalPages) {
  openPagination();
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  if (currentPage > 1) {
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.textContent = '上一页';
    prevLink.onclick = (e) => {
      e.preventDefault();
      fetchStudentsByClass(classId,currentPage - 1);
    };
    pagination.appendChild(prevLink);
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement(currentPage === i ? 'span' : 'a');
    pageLink.textContent = i;
    pageLink.className = currentPage === i ? 'current' : '';

    if (currentPage !== i) {
      pageLink.href = '#';
      pageLink.onclick = (e) => {
        e.preventDefault();
        fetchStudentsByClass(classId,i);
      };
    }

    pagination.appendChild(pageLink);
  }

  if (currentPage < totalPages) {
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.textContent = '下一页';
    nextLink.onclick = (e) => {
      e.preventDefault();
      fetchStudents(currentPage + 1);
    };
    pagination.appendChild(nextLink);
  }
}

// 更新分页
function updatePagination(currentPage, totalPages) {
  openPagination();
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  if (currentPage > 1) {
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.textContent = '上一页';
    prevLink.onclick = (e) => {
      e.preventDefault();
      fetchStudents(currentPage - 1);
    };
    pagination.appendChild(prevLink);
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement(currentPage === i ? 'span' : 'a');
    pageLink.textContent = i;
    pageLink.className = currentPage === i ? 'current' : '';

    if (currentPage !== i) {
      pageLink.href = '#';
      pageLink.onclick = (e) => {
        e.preventDefault();
        fetchStudents(i);
      };
    }

    pagination.appendChild(pageLink);
  }

  if (currentPage < totalPages) {
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.textContent = '下一页';
    nextLink.onclick = (e) => {
      e.preventDefault();
      fetchStudents(currentPage + 1);
    };
    pagination.appendChild(nextLink);
  }
}
// 删除学生
async function deleteStudent(studentId) {
  if (!confirm('确定要删除这个学生吗？')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/Db-delete?studentId=${studentId}&action=delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    if (data.success) {
      alert('删除成功');
      fetchStudents(); // 刷新数据
    } else {
      alert('删除失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('删除失败，请稍后重试');
  }
}

// 添加学生
document.getElementById('addStudentForm').addEventListener('submit', addStudent);
async function addStudent(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('http://localhost:8080/api/Db-insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stu_no: formData.get("stu_no"),
        stu_name: formData.get("stu_name"),
        class_id: formData.get("class_id")
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('添加成功');
      closeAddModal();
      fetchStudents(1);
    } else {
      alert('添加失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('添加失败，请稍后重试');
  }
}

document.getElementById('modifyStudentForm').addEventListener('submit', modifyStudent);
// 修改学生信息
async function modifyStudent(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('http://localhost:8080/api/Db-update', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stu_no: formData.get("studentId"),
        stu_name: formData.get("studentName"),
        class_id: formData.get("studentClass")
        })
    });

    const data = await response.json();

    if (data.success) {
      alert('修改成功');
      closeModifyModal();
      fetchStudents();
    } else {
      alert('修改失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('修改失败，请稍后重试');
  }
}


document.getElementById('searchStudentClassModal').addEventListener('submit',async function(event){
  event.preventDefault();
  const formData=new FormData(event.target);
    fetchStudentsByClass(1,formData.get("studentClass"));
    closeSearchClassModal();
});


// 搜索学生(根据学生学号或是学生姓名查询)
document.getElementById('searchStudentForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log(formData);

  try {
    const response = await fetch('http://localhost:8080/api/Db-Search', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      updateTable(data.students);
      closePagination();
      closeSearchModal();
    } else {
      alert('搜索失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('搜索失败，请稍后重试');
  }
});

// Modal 相关函数
const studentClass=document.getElementById("studentClass");
const addStudentModal=document.getElementById('addStudentModal');
async function OpenAddStudentModal(event) {
  addStudentModal.style.display = 'block';
  event.preventDefault();
  try {
    const response = await fetch('http://localhost:8080/api/Db-ClassSearch', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('网络请求失败');
    }

    const data = await response.json();
    if (data.success) {
      studentClass.innerHTML = '';
      data.StuClasses.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.class_id;
        option.textContent = item.class_name;
        studentClass.appendChild(option);
      });
    } else {
      alert('搜索失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('搜索失败，请稍后重试');
  }
}


const studentClassSelect = document.getElementById('studentClassSelect');
const studentClassSearchModal=document.getElementById('searchStudentClassModal');
async function openSearchClassModal(event) {
  studentClassSearchModal.style.display='block';
  event.preventDefault();

  try {
    const response = await fetch('http://localhost:8080/api/Db-ClassSearch', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('网络请求失败');
    }

    const data = await response.json();
    if (data.success) {
      studentClassSelect.innerHTML = '';
      data.StuClasses.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.class_id;
        option.textContent = item.class_name;
        studentClassSelect.appendChild(option);
      });
    } else {
      alert('搜索失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('搜索失败，请稍后重试');
  }
}

function closeSearchModal() {
  document.getElementById('searchStudentModal').style.display = 'none';
}
function openSearchModal() {
  document.getElementById('searchStudentModal').style.display = 'block';
}

function closeSearchClassModal() {
  document.getElementById('searchStudentClassModal').style.display = 'none';
}


function closeAddModal() {
  document.getElementById('addStudentModal').style.display = 'none';
}

const studentClassList=document.getElementById('modifyStudentClass');
async function openModifyModal(studentId, studentName, studentClass) {
  document.getElementById('modifyStudentId').value = studentId;
  document.getElementById('modifyStudentName').value = studentName;
  document.getElementById('modifyStudentClass').value = studentClass;
  event.preventDefault();
  try {
    const response = await fetch('http://localhost:8080/api/Db-ClassSearch', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('网络请求失败');
    }

    const data = await response.json();
    if (data.success) {
      studentClassList.innerHTML = '';
      data.StuClasses.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.class_id;
        option.textContent = item.class_name;
        if (item.class_id === studentClass) { // 替换为你的默认 class_id
          option.selected = true;
        }
        studentClassList.appendChild(option);
      });
    } else {
      alert('搜索失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('搜索失败，请稍后重试');
  }
  document.getElementById('modifyStudentModal').style.display = 'block';
}

function closeModifyModal() {
  document.getElementById('modifyStudentModal').style.display = 'none';
}

// 点击模态框外部关闭
window.onclick = function(event) {
  const modals = [
    document.getElementById('searchStudentModal'),
    document.getElementById('addStudentModal'),
    document.getElementById('modifyStudentModal'),
    document.getElementById('searchStudentClassModal')
  ];

  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}
