<?php

namespace common\models;

use common\models\query\PatVitalsUsersQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_vitals_users".
 *
 * @property integer $vital_user_id
 * @property integer $tenant_id
 * @property integer $vital_id
 * @property integer $user_id
 * @property string $seen
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoTenant $tenant
 * @property CoUser $user
 * @property PatVitals $vital
 */
class PatVitalsUsers extends RActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pat_vitals_users';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['tenant_id', 'vital_id', 'user_id'], 'required'],
            [['tenant_id', 'vital_id', 'user_id', 'created_by', 'modified_by'], 'integer'],
            [['seen'], 'string'],
            [['created_at', 'modified_at', 'patient_id'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'vital_user_id' => 'Vital User ID',
            'tenant_id' => 'Tenant ID',
            'vital_id' => 'Vital ID',
            'user_id' => 'User ID',
            'seen' => 'Seen',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
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

    /**
     * @return ActiveQuery
     */
    public function getVital()
    {
        return $this->hasOne(PatVitals::className(), ['vital_id' => 'vital_id']);
    }
    
    public static function find() {
        return new PatVitalsUsersQuery(get_called_class());
    }
}
