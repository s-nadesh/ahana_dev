<?php

namespace common\models;

use common\models\query\PatNotesUsersQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_notes_users".
 *
 * @property integer $vital_note_id
 * @property integer $tenant_id
 * @property integer $note_id
 * @property integer $user_id
 * @property integer $patient_id
 * @property string $seen
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatNotes $note
 * @property CoTenant $tenant
 * @property CoUser $user
 */
class PatNotesUsers extends RActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pat_notes_users';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tenant_id', 'note_id', 'user_id', 'patient_id', 'created_by'], 'required'],
            [['tenant_id', 'note_id', 'user_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
            [['seen'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'vital_note_id' => 'Vital Note ID',
            'tenant_id' => 'Tenant ID',
            'note_id' => 'Note ID',
            'user_id' => 'User ID',
            'patient_id' => 'Patient ID',
            'seen' => 'Seen',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getNote()
    {
        return $this->hasOne(PatNotes::className(), ['pat_note_id' => 'note_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant()
    {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(CoUser::className(), ['user_id' => 'user_id']);
    }
    
    public static function find() {
        return new PatNotesUsersQuery(get_called_class());
    }
}
