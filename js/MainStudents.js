// 页面加载时获取学生数据
document.addEventListener('DOMContentLoaded', function() {
  fetchStudents(1);
  document.removeEventListener('DOMContentLoaded', arguments.callee);
});

// 获取学生数据根据页码查询
async function fetchStudents(page = 1) {
  try {
    document.getElementById('returnBtn').style.display='none';
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

//获取同班学生根据页码查询
async function fetchStudentsByDetails(page = 1,formData) {
  try {
    formData.currentPage=page;
    const response = await fetch('http://localhost:8080/api/Db-SearchStuByDetail',{
              method: 'POST',
             headers: {
                  'Content-Type': 'application/json'
             },
              body: JSON.stringify(formData)
          });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // 检查返回的数据结构
    if (data.stuInfo) {
      updateTable(data.stuInfo);
      updateDetailPagination(formData,data.currentPage, data.totalPages);
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
                <td>${student.stu_Class.subject.subjectName}</td>
                <td>${student.stu_Class.subject.department.department_name}</td>
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


//更新查询分页功能，更新页码
function updateDetailPagination(formData,currentPage, totalPages) {
  const pagination = document.querySelector('.pagination');
  document.getElementById('returnBtn').style.display='flex';
  pagination.innerHTML = '';

  if (currentPage > 1) {
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.textContent = '上一页';
    prevLink.onclick = (e) => {
      e.preventDefault();
      fetchStudentsByDetails(currentPage - 1,formData);
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
        fetchStudentsByDetails(i,formData);
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
      fetchStudentsByDetails(currentPage + 1,formData);
    };
    pagination.appendChild(nextLink);
  }
}

// 更新分页，更新页码
function updatePagination(currentPage, totalPages) {

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

// 获取表单元素
const searchButton = document.getElementById('searchButton');

// 定义一个函数，用于从表单中获取数据
function getFormValues() {
  const stuNo = document.getElementById('stuNo').value;
  const stuName = document.getElementById('stuName').value;
  // const email = document.getElementById('email').value;
  const departmentId = document.getElementById('studentDepartments').value;
  const classId = document.getElementById('studentClasses').value;
  const subjectId = document.getElementById('studentSubjects').value;

  return {
    stuNo: stuNo || null,
    stuName: stuName || null,
    // email: email || null,
    departmentId: departmentId || null,
    classId: classId || null,
    subjectId: subjectId || null
  };
}
searchButton.addEventListener('click', () => {
  const formValues = getFormValues();
  console.log('Form Values:', formValues);

  // 调用后端接口或其他逻辑
  fetchStudentsByDetails(1,formValues);
  closeSearchModal();

});

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

// 修改学生信息
document.getElementById('modifyStudentForm').addEventListener('submit', modifyStudent);
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



//添加学生model及按钮
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

//更新学生信息
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


// Modal 相关函数
function closeSearchModal() {
  document.getElementById('searchStudentModal').style.display = 'none';
}

const studentClassSelect=document.getElementById('studentClasses');
const studentSubjectSelect=document.getElementById('studentSubjects');
const studentDepartmentSelect=document.getElementById('studentDepartments');
let data;
async function openSearchModal(event) {
  document.getElementById('searchStudentModal').style.display = 'block';
  event.preventDefault();
  try {
    const response = await fetch('http://localhost:8080/api/Db-ClassSearch', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('网络请求失败');
    }

    data = await response.json();

    studentSubjectSelect.innerHTML = '';
    studentClassSelect.innerHTML = '';
    studentDepartmentSelect.innerHTML = '';


    const defaultClassOption = document.createElement('option');
    defaultClassOption.value = '0'; // 默认选项的值为空或一个特定值
    defaultClassOption.textContent = '班级不限'; // 默认选项的文本
    defaultClassOption.id='defaultClassId';
    defaultClassOption.selected = true; // 设置为默认选中
    studentClassSelect.appendChild(defaultClassOption);

    const defaultSubjectOption = document.createElement('option');
    defaultSubjectOption.value = '0'; // 默认选项的值为空或一个特定值
    defaultSubjectOption.textContent = '专业不限'; // 默认选项的文本
    defaultSubjectOption.id='defaultSubjectId';
    defaultSubjectOption.selected = true; // 设置为默认选中
    studentSubjectSelect.appendChild(defaultSubjectOption);

    const defaultDepartmentOption = document.createElement('option');
    defaultDepartmentOption.value = '0'; // 默认选项的值为空或一个特定值
    defaultDepartmentOption.textContent = '学院不限'; // 默认选项的文本
    defaultDepartmentOption.id='defaultDepartmentId';
    defaultDepartmentOption.selected = true; // 设置为默认选中
    studentDepartmentSelect.appendChild(defaultDepartmentOption);

    if (data.success) {

      data.StuClasses.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.class_id;
        option.id="class"+item.class_id;
        option.textContent = item.class_name;
        studentClassSelect.appendChild(option);
      });

      data.subjects.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.subjectId;
        option.id ="subject"+item.subjectId;
        console.log(item.department_id);
        option.textContent = item.subjectName;
        studentSubjectSelect.appendChild(option);
      });

      data.departments.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.department_id;
        option.id = "department"+item.department_id;
        option.textContent = item.department_name;
        studentDepartmentSelect.appendChild(option);
      });

      studentClassSelect.addEventListener('change', updateSubjectSelect);
      studentSubjectSelect.addEventListener('change', resetClass);
      studentDepartmentSelect.addEventListener('change', resetClassAndSubject);
    } else {
      alert('搜索失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('搜索失败，请稍后重试');
  }
}

// 根据班级更新专业下拉框
function updateSubjectSelect() {
  // 获取当前选择的班级
  const selectedClassId = studentClassSelect.value;
  const selectedClass = data.StuClasses.find(item => item.class_id == selectedClassId);

  if (selectedClass) {
    // 更新科目下拉框
    const selectedSubject = data.subjects.find(item => item.subjectId == selectedClass.subjectId);
    if (selectedSubject) {
      const subjectObjectSelect=document.getElementById("subject"+selectedSubject.subjectId);
      subjectObjectSelect.selected = true;
      // 更新学院下拉框
      updateDepartmentSelect();
    }
  }
}

// 根据科目更新学院下拉框
function updateDepartmentSelect() {
  const selectedSubjectId = studentSubjectSelect.value;
  const selectedSubject = data.subjects.find(item => item.subjectId == selectedSubjectId);
  // for (const key in selectedSubject) {
  //   if (selectedSubject.hasOwnProperty(key)) {
  //     console.log(`${key}: ${selectedSubject[key]}`);
  //   }
  // }
  const selectedDepartment=data.departments.find(item=>item.department_id=selectedSubject.department_id);
  const departmentObjectSelect = document.getElementById("department" + selectedDepartment.department_id);
  departmentObjectSelect.selected = true;
}

function resetClass(){
  const classSelect=document.getElementById('defaultClassId');
  classSelect.selected=true;
  updateDepartmentSelect();
}
function resetClassAndSubject() {
  const subjectSelect=document.getElementById('defaultSubjectId');
  subjectSelect.selected=true;

  const classSelect=document.getElementById('defaultClassId');
  classSelect.selected=true;
}


function closeAddModal() {
  document.getElementById('addStudentModal').style.display = 'none';
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



// function closeSearchClassModal() {
//   document.getElementById('searchStudentClassModal').style.display = 'none';
// }
// function openPagination() {
//   const pagination = document.querySelector('.pagination');
//   if (pagination) {
//     pagination.style.display = 'flex'; // 显示分页链接
//     document.getElementById('returnBtn').style.display='none';
//   }
// }
// function closePagination() {
//   const pagination = document.querySelector('.pagination');
//   if (pagination) {
//     pagination.style.display = 'none'; // 隐藏分页链接
//     document.getElementById('returnBtn').style.display='flex';
//   }
// }
// // 搜索学生按钮(根据学生学号或是学生姓名查询)
// document.getElementById('searchStudentForm').addEventListener('submit', async function(event) {
//   event.preventDefault();
//   const formData = new FormData(event.target);
//   console.log(formData);
//
//   try {
//     const response = await fetch('http://localhost:8080/api/Db-Search', {
//       method: 'POST',
//       body: formData
//     });
//
//     const data = await response.json();
//
//     if (data.success) {
//       updateTable(data.students);
//       closePagination();
//       closeSearchModal();
//     } else {
//       alert('搜索失败：' + data.message);
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     alert('搜索失败，请稍后重试');
//   }
// });
//

// //搜索同班学生按钮
// document.getElementById('searchStudentClassModal').addEventListener('submit',async function(event){
//   event.preventDefault();
//   const formData=new FormData(event.target);
//     fetchStudentsByClass(1,formData.get("studentClass"));
//     closeSearchClassModal();
// });
// //搜索同班学生model
// const studentClassSelect = document.getElementById('studentClassSelect');
// const studentClassSearchModal=document.getElementById('searchStudentClassModal');
// async function openSearchClassModal(event) {
//   studentClassSearchModal.style.display='block';
//   event.preventDefault();
//
//   try {
//     const response = await fetch('http://localhost:8080/api/Db-ClassSearch', {
//       method: 'GET',
//     });
//
//     if (!response.ok) {
//       throw new Error('网络请求失败');
//     }
//
//     const data = await response.json();
//     if (data.success) {
//       studentClassSelect.innerHTML = '';
//       data.StuClasses.forEach((item) => {
//         const option = document.createElement('option');
//         option.value = item.class_id;
//         option.textContent = item.class_name;
//         studentClassSelect.appendChild(option);
//       });
//     } else {
//       alert('搜索失败：' + data.message);
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     alert('搜索失败，请稍后重试');
//   }
// }
